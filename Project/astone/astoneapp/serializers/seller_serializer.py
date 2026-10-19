from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from astoneapp.models.seller import Seller
from astoneapp.models.todo import Todo


class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        exclude = ['id', 'seller']


class SellerTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        seller = Seller.objects.filter(user=user).first()
        token['role'] = 'seller'
        token['seller_id'] = seller.id if seller else None
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        if not Seller.objects.filter(user=self.user).exists():
            raise serializers.ValidationError({'detail': 'This account is not a seller account.'})
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'password', 'email', 'date_joined']
        read_only_fields = ['date_joined']
        extra_kwargs = {'password': {'write_only': True, 'min_length': 8}}

    def validate_email(self, value):
        qs = User.objects.filter(email__iexact=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('A seller with this email already exists.')
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class SellerSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    todo = TodoSerializer(read_only=True)

    class Meta:
        model = Seller
        fields = ['id', 'user', 'gender', 'phone_number', 'address', 'shop_name', 'todo']
        read_only_fields = ['id']

    def validate_shop_name(self, value):
        qs = Seller.objects.filter(shop_name__iexact=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('A seller with this shop name already exists.')
        return value

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['username'] = user_data.get('username') or user_data.get('email')
        user = UserSerializer().create(user_data)
        seller = Seller.objects.create(user=user, **validated_data)
        Todo.objects.create(seller=seller)
        return seller

    def update(self, instance, validated_data):
        # Only names can be changed on the nested user; email/username/password have their own flows.
        user_data = validated_data.pop('user', {}) or {}
        for field in ('first_name', 'last_name'):
            if field in user_data:
                setattr(instance.user, field, user_data[field])
        instance.user.save()
        return super().update(instance, validated_data)


class SellerForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class SellerChangePasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
