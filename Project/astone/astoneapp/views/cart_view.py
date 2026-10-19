from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from astoneapp.auth import IsCustomer
from astoneapp.models.cart import Cart, CartItem
from astoneapp.models.product import Product
from astoneapp.serializers.product_serializer import ProductSerializer


def get_single_cart(user):
    cart = Cart.objects.filter(user=user).first()
    return cart or Cart.objects.create(user=user)


def serialize_cart(cart):
    items = CartItem.objects.filter(cart=cart).select_related('product').prefetch_related('product__images')
    data = [
        {
            'product_id': item.product.id,
            'product': ProductSerializer(item.product).data,
            'size': item.size,
            'color': item.color,
            'quantity': item.quantity,
            'price': item.product.price,
            'total_price': item.product.price * item.quantity,
        }
        for item in items
    ]
    total = sum((row['total_price'] for row in data), 0)
    return {
        'cart_items': data,
        'item_count': sum(row['quantity'] for row in data),
        'total_price': total,
    }


def _parse_quantity(value, default):
    try:
        return int(value if value not in (None, '') else default)
    except (TypeError, ValueError):
        return None


@api_view(['GET', 'POST'])
@permission_classes([IsCustomer])
def cart_detail(request):
    return Response(serialize_cart(get_single_cart(request.user)))


@api_view(['POST'])
@permission_classes([IsCustomer])
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    size = request.data.get('size')
    color = request.data.get('color')
    quantity = _parse_quantity(request.data.get('quantity'), 1)

    if not size or not color:
        return Response({'detail': 'Please choose a size and a colour.'}, status=status.HTTP_400_BAD_REQUEST)
    if quantity is None or quantity < 1:
        return Response({'detail': 'Quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)

    cart = get_single_cart(request.user)
    item, created = CartItem.objects.get_or_create(
        cart=cart, product=product, size=size, color=color, defaults={'quantity': 0}
    )
    if item.quantity + quantity > product.stock:
        if created:
            item.delete()
        return Response({'detail': f'Only {product.stock} left in stock.'}, status=status.HTTP_400_BAD_REQUEST)

    item.quantity += quantity
    item.save()
    return Response({'detail': 'Added to your bag.', **serialize_cart(cart)})


@api_view(['POST'])
@permission_classes([IsCustomer])
def update_cart_item(request, product_id):
    cart = get_single_cart(request.user)
    quantity = _parse_quantity(request.data.get('quantity'), None)
    if quantity is None:
        return Response({'detail': 'Invalid quantity value.'}, status=status.HTTP_400_BAD_REQUEST)

    item = CartItem.objects.filter(
        cart=cart, product_id=product_id,
        size=request.data.get('size'), color=request.data.get('color'),
    ).select_related('product').first()
    if item is None:
        return Response({'detail': 'Item not found in your bag.'}, status=status.HTTP_404_NOT_FOUND)

    if quantity <= 0:
        item.delete()
    elif quantity > item.product.stock:
        return Response({'detail': f'Only {item.product.stock} left in stock.'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        item.quantity = quantity
        item.save()
    return Response(serialize_cart(cart))
