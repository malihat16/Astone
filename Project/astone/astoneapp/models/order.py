from django.db import models
from astoneapp.models.product import Product
from astoneapp.models.user import CustomUser
from astoneapp.models.seller import Seller


class Order(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    address = models.CharField(max_length=255, help_text="Delivery address", default="")


class OrderItem(models.Model):
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, null=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    size = models.CharField(max_length=10, default='M', help_text="Size of the product")
    color = models.CharField(max_length=20, default='#FF0000', help_text="Hex code for the color of the product")
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_shipped = models.BooleanField(default=False, help_text="Set when the seller processes the shipment")
