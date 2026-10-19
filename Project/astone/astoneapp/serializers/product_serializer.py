from rest_framework import serializers
from astoneapp.models.product import Product
from astoneapp.models.image import Image
from astoneapp.serializers.promotion_serializer import PromotionSerializer
# Serializer serialize model instances into json objects for response
class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['image_url']

class ProductSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)
    promotions = PromotionSerializer(many=False, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {"seller": {"read_only": True}}

    # def get_default_image(self, obj):
    #     if obj.images.exists():
    #         return obj.images.first().image_url.url
    #     return 'path/to/placeholder/image.png'

class ProductCreateResponseSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)

