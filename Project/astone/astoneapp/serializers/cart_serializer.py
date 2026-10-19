from rest_framework import serializers
from .product_serializer import ProductSerializer
from ..models.order import OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()

    class Meta:
        model = OrderItem
        fields = '__all__'
