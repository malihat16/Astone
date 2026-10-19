from rest_framework import serializers
from ..models.user import CustomUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'gender', 'phone_number', 'address', 'points']
        # Customers can edit their profile, but not their email or loyalty points.
        read_only_fields = ['id', 'email', 'points']


class UserForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class UserChangePasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
