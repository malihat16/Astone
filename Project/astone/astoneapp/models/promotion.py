from astoneapp.models.product import Product;
from django.db import models

class Promotion(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="promotions")
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Discount percentage for the promotion")
    start_date = models.DateTimeField(help_text="Promotion start date")
    end_date = models.DateTimeField(help_text="Promotion end date")
    is_active = models.BooleanField(default=True, help_text="Is the promotion currently active")

    def __str__(self):
        return f"{self.discount_percentage}% off on {self.product.name}"