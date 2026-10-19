from django.db import models
from astoneapp.models.seller import Seller

class Todo(models.Model):
    seller = models.OneToOneField(Seller, on_delete=models.CASCADE, related_name="todo")
    unpaid = models.PositiveBigIntegerField(default=0)
    to_processed_shipment = models.PositiveBigIntegerField(default=0)
    processed_shipment = models.PositiveBigIntegerField(default=0)
    pending_cancellation = models.PositiveBigIntegerField(default=0)
    pending_return = models.PositiveBigIntegerField(default=0)
    removed_product = models.PositiveBigIntegerField(default=0)
    sold_product = models.PositiveBigIntegerField(default=0)
    pending_promotion = models.PositiveBigIntegerField(default=0)
