from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
# Register your models here
from .models.product import Product

from .models.seller import Seller
from .models.promotion import Promotion

admin.site.register(Product)
admin.site.register(Seller)
admin.site.register(Promotion)
from .models.image import Image
from .models.cart import Cart, CartItem
from .models.order import Order, OrderItem
from .models.user import CustomUser


admin.site.register(Image)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(CustomUser)

from .models.todo import Todo
from .models.notification import Notification

# To customise how the notification display at the admin site
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id','notif_subject','notif_for','notifiread_status']

admin.site.register(Todo)
admin.site.register(Notification)