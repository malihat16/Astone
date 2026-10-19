from django.db import models, transaction
from astoneapp.models.product import Product
from astoneapp.models.user import CustomUser


class Cart(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    size = models.CharField(max_length=10, default='M', help_text="Size of the product")
    color = models.CharField(max_length=20, default='#FF0000', help_text="Hex code for the color of the product")