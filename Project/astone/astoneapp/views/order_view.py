from decimal import Decimal

from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from astoneapp.auth import IsCustomer
from astoneapp.models.cart import Cart, CartItem
from astoneapp.models.order import Order, OrderItem
from astoneapp.models.product import Product
from astoneapp.models.todo import Todo
from astoneapp.models.user import CustomUser
from ..serializers.cart_serializer import OrderItemSerializer

CASHBACK_RATE = Decimal('0.10')  # customers earn 10% of what they pay back as points


def serialize_order(order):
    items = order.orderitem_set.select_related('product').prefetch_related('product__images')
    return {
        'id': order.id,
        'created_at': order.created_at,
        'total_price': order.total_price,
        'address': order.address,
        'is_paid': order.is_paid,
        'order_items': OrderItemSerializer(items, many=True).data,
    }


@api_view(['POST'])
@permission_classes([IsCustomer])
def place_order(request):
    address = (request.data.get('address') or '').strip()
    if not address:
        return Response({'detail': 'A delivery address is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        points_to_use = max(0, int(request.data.get('points_to_use') or 0))
    except (TypeError, ValueError):
        return Response({'detail': 'Invalid points value.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        # Lock the customer row so points can't be spent twice by parallel requests.
        user = CustomUser.objects.select_for_update().get(pk=request.user.pk)
        cart = Cart.objects.filter(user=user).first()
        cart_items = list(
            CartItem.objects.filter(cart=cart).select_related('product') if cart else []
        )
        if not cart_items:
            return Response({'detail': 'Your bag is empty.'}, status=status.HTTP_400_BAD_REQUEST)
        if points_to_use > user.points:
            return Response({'detail': 'You do not have enough points.'}, status=status.HTTP_400_BAD_REQUEST)

        products = {
            p.id: p for p in Product.objects.select_for_update().filter(
                id__in=[item.product_id for item in cart_items]
            )
        }
        for item in cart_items:
            if item.quantity > products[item.product_id].stock:
                return Response(
                    {'detail': f'Sorry, only {products[item.product_id].stock} of '
                               f'"{products[item.product_id].name}" left in stock.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        subtotal = sum((products[i.product_id].price * i.quantity for i in cart_items), Decimal('0.00'))
        points_to_use = min(points_to_use, int(subtotal))  # never discount below zero
        total = subtotal - Decimal(points_to_use)

        order = Order.objects.create(user=user, address=address, total_price=total, is_paid=True)
        shipments_per_seller = {}
        for item in cart_items:
            product = products[item.product_id]
            OrderItem.objects.create(
                order=order, product=product, seller_id=product.seller_id,
                size=item.size, color=item.color, quantity=item.quantity, price=product.price,
            )
            Product.objects.filter(pk=product.pk).update(stock=F('stock') - item.quantity)
            shipments_per_seller[product.seller_id] = shipments_per_seller.get(product.seller_id, 0) + 1

        # Tell each seller they have new shipments to process.
        for seller_id, count in shipments_per_seller.items():
            Todo.objects.filter(seller_id=seller_id).update(
                to_processed_shipment=F('to_processed_shipment') + count
            )

        CartItem.objects.filter(cart=cart).delete()

        cashback = int(total * CASHBACK_RATE)
        user.points = user.points - points_to_use + cashback
        user.save(update_fields=['points'])

    return Response(
        {
            'detail': 'Order placed',
            'order_id': order.id,
            'cashback': cashback,
            'points_used': points_to_use,
            'points_balance': user.points,
            'order': serialize_order(order),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@permission_classes([IsCustomer])
def order_list(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    return Response([serialize_order(order) for order in orders])


@api_view(['GET'])
@permission_classes([IsCustomer])
def order_detail(request, order_id):
    # Filtering by user means another customer's order id simply returns 404.
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return Response(serialize_order(order))
