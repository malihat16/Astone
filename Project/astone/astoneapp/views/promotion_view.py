from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny

from astoneapp.auth import IsSeller, get_seller
from astoneapp.models.promotion import Promotion
from astoneapp.serializers.promotion_serializer import PromotionSerializer
from astoneapp.views.product_view import discounted


def _check_owner(request, product):
    if product.seller_id != getattr(get_seller(request.user), 'id', None):
        raise PermissionDenied('You can only run promotions on your own products.')


class PromotionListCreate(generics.ListCreateAPIView):
    """
    GET ?product=<id> lists a product's promotion (public).
    POST starts a promotion and updates the product's selling price.
    """
    serializer_class = PromotionSerializer

    def get_permissions(self):
        return [AllowAny()] if self.request.method == 'GET' else [IsSeller()]

    def get_queryset(self):
        product_id = self.request.query_params.get('product')
        return Promotion.objects.filter(product=product_id) if product_id else Promotion.objects.none()

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        _check_owner(self.request, product)
        if Promotion.objects.filter(product=product).exists():
            raise ValidationError({'detail': 'This product already has a promotion. End it first.'})
        percentage = serializer.validated_data['discount_percentage']
        if not 0 < percentage < 100:
            raise ValidationError({'discount_percentage': 'Enter a discount between 1 and 99%.'})
        if serializer.validated_data['end_date'] <= serializer.validated_data['start_date']:
            raise ValidationError({'end_date': 'The end date must be after the start date.'})

        with transaction.atomic():
            serializer.save()
            product.price = discounted(product.original_price or product.price, percentage)
            product.save(update_fields=['price'])


class PromotionDelete(generics.DestroyAPIView):
    """End a promotion and restore the product's regular price."""
    serializer_class = PromotionSerializer
    permission_classes = [IsSeller]

    def get_object(self):
        promotion = get_object_or_404(Promotion.objects.select_related('product'), id=self.kwargs.get('promotion_id'))
        _check_owner(self.request, promotion.product)
        return promotion

    def perform_destroy(self, instance):
        with transaction.atomic():
            product = instance.product
            instance.delete()
            product.price = product.original_price or product.price
            product.save(update_fields=['price'])
