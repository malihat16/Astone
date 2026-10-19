import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from astoneapp.auth import IsSeller, get_seller, make_reset_token, read_reset_token
from astoneapp.models.order import OrderItem
from astoneapp.models.todo import Todo
from astoneapp.serializers.seller_serializer import (
    SellerChangePasswordSerializer, SellerForgotPasswordSerializer,
    SellerSerializer, SellerTokenObtainPairSerializer,
)

logger = logging.getLogger(__name__)


class SellerTokenObtainPairView(TokenObtainPairView):
    serializer_class = SellerTokenObtainPairSerializer


class SellerRegisterView(generics.CreateAPIView):
    serializer_class = SellerSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response({'detail': 'Seller account created. You can log in now.'}, status=status.HTTP_201_CREATED)


class SellerMeView(APIView):
    """The logged-in seller's own profile and to-do counters."""
    permission_classes = [IsSeller]

    def get(self, request):
        return Response(SellerSerializer(get_seller(request.user)).data)

    def patch(self, request):
        serializer = SellerSerializer(get_seller(request.user), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    put = patch


class SellerGetView(SellerMeView):
    """Kept for the old /seller/<pk>/ URL, but only works for your own pk."""

    def _check(self, request, pk):
        if get_seller(request.user).pk != pk:
            return Response({'detail': 'You can only view your own seller profile.'}, status=status.HTTP_403_FORBIDDEN)
        return None

    def get(self, request, pk):
        return self._check(request, pk) or super().get(request)

    def patch(self, request, pk):
        return self._check(request, pk) or super().patch(request)

    put = patch


def _seller_order_rows(seller, include_shipped):
    items = OrderItem.objects.filter(seller=seller).select_related('order', 'product').order_by('-order__created_at')
    if not include_shipped:
        items = items.filter(is_shipped=False)
    return [{
        'id': item.id,
        'order_id': item.order_id,
        'product_id': item.product_id,
        'product_name': item.product.name,
        'size': item.size,
        'color': item.color,
        'quantity': item.quantity,
        'price': item.price,
        'is_paid': item.order.is_paid,
        'is_shipped': item.is_shipped,
        'address': item.order.address,
        'created_at': item.order.created_at,
    } for item in items]


class SellerOrdersView(APIView):
    """Order lines for the logged-in seller. ?all=1 includes already-shipped lines."""
    permission_classes = [IsSeller]

    def get(self, request, pk=None):
        seller = get_seller(request.user)
        if pk is not None and pk != seller.pk:
            return Response({'detail': 'You can only view your own orders.'}, status=status.HTTP_403_FORBIDDEN)
        include_shipped = request.query_params.get('all') in ('1', 'true')
        return Response(_seller_order_rows(seller, include_shipped))


class SellerShipOrderItemView(APIView):
    """Mark one order line as shipped and update the dashboard counters."""
    permission_classes = [IsSeller]

    def post(self, request, item_id):
        seller = get_seller(request.user)
        with transaction.atomic():
            item = get_object_or_404(OrderItem.objects.select_for_update(), id=item_id, seller=seller)
            if item.is_shipped:
                return Response({'detail': 'This item has already been shipped.'}, status=status.HTTP_400_BAD_REQUEST)
            item.is_shipped = True
            item.save(update_fields=['is_shipped'])
            todo, _ = Todo.objects.get_or_create(seller=seller)
            Todo.objects.filter(pk=todo.pk, to_processed_shipment__gt=0).update(
                to_processed_shipment=F('to_processed_shipment') - 1
            )
            Todo.objects.filter(pk=todo.pk).update(
                processed_shipment=F('processed_shipment') + 1,
                sold_product=F('sold_product') + item.quantity,
            )
        return Response(SellerSerializer(seller).data['todo'])


class SellerForgotPassword(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SellerForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=serializer.validated_data['email'], seller__isnull=False).first()
        if user:
            link = f"{settings.FRONTEND_URL}/SellerChangePassword/{make_reset_token('seller', user)}"
            try:
                send_mail(
                    subject='Reset your Astoné Seller Centre password',
                    message=f'Use this link to choose a new password: {link}',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=f"<p>Use this link to choose a new password:</p><p><a href=\"{link}\">{link}</a></p>"
                                 f"<p>The link expires in 24 hours.</p>",
                )
            except Exception:
                logger.exception('Could not send seller password reset email')
        return Response({'detail': 'If a seller account with that email exists, a reset link is on its way.'})


class SellerChangePassword(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SellerChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = read_reset_token('seller', serializer.validated_data['token'], User)
        if user is None:
            return Response({'detail': 'This reset link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['password'])
        user.save(update_fields=['password'])
        return Response({'detail': 'Your password has been changed. You can log in now.'})

    put = post
