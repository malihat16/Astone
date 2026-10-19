from django.db import models, transaction
from astoneapp.models.user import CustomUser
from astoneapp.models import Seller

class Notification(models.Model):
    custom_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE,null=True)
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE,null=True)
    notif_subject = models.CharField(max_length=200, verbose_name='Notification subject',null=True)
    notif_for = models.CharField(max_length=200, verbose_name='Notification for')
    notif_created_time=models.DateTimeField(auto_now_add=True)
    notifiread_status=models.BooleanField(default=False)
