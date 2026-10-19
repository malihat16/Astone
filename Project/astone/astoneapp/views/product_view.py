from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from astoneapp.auth import IsSeller, get_seller
from astoneapp.models.image import Image
from astoneapp.models.product import Product
from astoneapp.models.promotion import Promotion
from astoneapp.serializers.product_serializer import ProductSerializer


def product_queryset():
    return Product.objects.prefetch_related(
        'images', Prefetch('promotions', queryset=Promotion.objects.all())
    ).order_by('-id')


def discounted(price, percentage):
    price = Decimal(price) * (Decimal('1') - Decimal(percentage) / Decimal('100'))
    return price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


class ProductListCreate(generics.ListCreateAPIView):
    """A seller's own products (GET) and creating a new product (POST)."""
    serializer_class = ProductSerializer
    permission_classes = [IsSeller]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return product_queryset().filter(seller=get_seller(self.request.user))

    def perform_create(self, serializer):
        with transaction.atomic():
            price = serializer.validated_data.get('price', Decimal('0'))
            product = serializer.save(seller=get_seller(self.request.user), original_price=price)
            for image in self.request.FILES.getlist('images'):
                Image.objects.create(product=product, image_url=image)


@api_view(['GET'])
@permission_classes([AllowAny])
def GetProductView(request):
    """Public catalogue. Optional ?gender=M|F|U filter."""
    products = product_queryset()
    gender = request.query_params.get('gender')
    if gender:
        products = products.filter(gender__iexact=gender)
    return Response(ProductSerializer(products, many=True).data)


def _owned_product_or_403(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if product.seller_id != getattr(get_seller(request.user), 'id', None):
        return product, Response({'detail': 'You can only change your own products.'},
                                 status=status.HTTP_403_FORBIDDEN)
    return product, None


class ProductDetailView(APIView):
    """GET is public; DELETE is only for the seller who owns the product."""

    def get_permissions(self):
        return [AllowAny()] if self.request.method == 'GET' else [IsSeller()]

    def get(self, request, pk):
        product = get_object_or_404(product_queryset(), pk=pk)
        return Response(ProductSerializer(product).data)

    def delete(self, request, pk):
        product, denied = _owned_product_or_403(request, pk)
        if denied:
            return denied
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsSeller])
def UpdateProductView(request, pk):
    """
    Edit a product. Sending ``price`` sets the regular (pre-discount) price;
    if a promotion is running, the selling price is recalculated from it.
    """
    product, denied = _owned_product_or_403(request, pk)
    if denied:
        return denied

    data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
    for read_only in ('original_price', 'promotion_price', 'seller'):
        data.pop(read_only, None)

    serializer = ProductSerializer(product, data=data, partial=True)
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        product = serializer.save()
        if 'price' in data:
            product.original_price = product.price
            promotion = Promotion.objects.filter(product=product).first()
            if promotion:
                product.price = discounted(product.original_price, promotion.discount_percentage)
            product.save(update_fields=['price', 'original_price'])
    return Response(ProductSerializer(get_object_or_404(product_queryset(), pk=pk)).data)
