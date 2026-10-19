from django.db import models, transaction
from astoneapp.models.seller import Seller;

class Product(models.Model):
    name = models.CharField(max_length = 30, null=False, default='', help_text="name of the product")    
    description = models.CharField(max_length = 100, null=False, default='', help_text="description of the product")    
    category = models.CharField(default=list, help_text="category for the product")        
    colors = models.JSONField(default=list, help_text="array of available colors for the product") # Json object format: {'name': 'Red', 'hex': '#FF0000'}
    sizes = models.JSONField(default=list, help_text="array of available sizes for the product") # Json object format: {'name': 'Small', 'code': 'S'}
    currency = models.CharField(max_length = 30, null=False, default='MYR', help_text="currency of the product's price")
    price = models.DecimalField(max_digits=10, null=False, default=0.00, decimal_places=2, help_text="price of the product")
    original_price = models.DecimalField(max_digits=10, null=False, default=0.00, decimal_places=2, help_text="original price of the product")
    promotion_price = models.DecimalField(max_digits=10, null=False, default=-1.00, decimal_places=2, help_text="price of the product")
    stock = models.PositiveBigIntegerField(null=False, default=0, help_text="available stock of the product")
    rating = models.PositiveBigIntegerField(null=False, default=0, help_text="available rating of the product")
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name="products")
    brand = models.CharField(null=False, default=0, help_text="brand of the product")
    gender = models.CharField(null=False, default=0, help_text="gender of the product")

    def __str__(self):
        return self.name
