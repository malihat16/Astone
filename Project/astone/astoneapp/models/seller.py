from django.db import models
from django.contrib.auth.models import User, AbstractUser
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.base_user import BaseUserManager

class Seller(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Specific fields:
    gender = models.CharField(max_length=10, null=False, default='', help_text="gender of the seller")
    phone_number = models.PositiveBigIntegerField(null=False, default='', help_text="phone number of the seller")
    address = models.TextField(null=False, default='', help_text="address of the seller")
    shop_name = models.TextField(null=False, default='shop', help_text="shop name")
    

    def __str__(self):
        return str(self.user)