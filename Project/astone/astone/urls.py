"""URL routes for the Astoné API."""
from django.conf import settings
from django.contrib import admin
from django.urls import path, re_path
from django.views.static import serve
from rest_framework_simplejwt.views import TokenRefreshView

from astoneapp.views.cart_view import add_to_cart, cart_detail, update_cart_item
from astoneapp.views.order_view import order_detail, order_list, place_order
from astoneapp.views.product_view import GetProductView, ProductDetailView, ProductListCreate, UpdateProductView
from astoneapp.views.promotion_view import PromotionDelete, PromotionListCreate
from astoneapp.views.seller_view import (
    SellerChangePassword, SellerForgotPassword, SellerGetView, SellerMeView, SellerOrdersView,
    SellerRegisterView, SellerShipOrderItemView, SellerTokenObtainPairView,
)
from astoneapp.views.user_view import change_password, forgot_password, login_user, me, register_user

urlpatterns = [
    path('admin/', admin.site.urls),

    # Catalogue (public) and seller product management
    path('products/', GetProductView, name='products'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    path('products/<int:pk>/edit', UpdateProductView, name='product_edit'),
    path('auth_products/', ProductListCreate.as_view(), name='seller_products'),
    path('promotions/', PromotionListCreate.as_view(), name='promotions'),
    path('promotions/<int:promotion_id>/delete/', PromotionDelete.as_view(), name='delete_promotion'),

    # Customer accounts (JWT)
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', me, name='me'),
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('change-password/', change_password, name='change_password'),

    # Customer bag and orders
    path('cart/', cart_detail, name='cart_detail'),
    path('add_to_cart/<int:product_id>/', add_to_cart, name='add_to_cart'),
    path('update_cart/<int:product_id>/', update_cart_item, name='update_cart'),
    path('place_order/', place_order, name='place_order'),
    path('orders/', order_list, name='order_list'),
    path('order/<int:order_id>/', order_detail, name='order_detail'),

    # Sellers
    path('seller/register/', SellerRegisterView.as_view(), name='seller_register'),
    path('seller/token/', SellerTokenObtainPairView.as_view(), name='seller_token'),
    path('seller/token/refresh', TokenRefreshView.as_view(), name='seller_token_refresh'),
    path('seller/token/refresh/', TokenRefreshView.as_view()),
    path('seller/me/', SellerMeView.as_view(), name='seller_me'),
    path('seller/orders/', SellerOrdersView.as_view(), name='seller_orders'),
    path('seller/orders/<int:item_id>/ship/', SellerShipOrderItemView.as_view(), name='seller_ship_item'),
    path('seller/<int:pk>/', SellerGetView.as_view(), name='seller_detail'),
    path('seller/<int:pk>/orders/', SellerOrdersView.as_view(), name='seller_orders_by_pk'),
    path('seller/seller-forgot-password/', SellerForgotPassword.as_view(), name='seller_forgot_password'),
    path('seller/seller-change-password/', SellerChangePassword.as_view(), name='seller_change_password'),

    # Uploaded product images. Fine for a demo; use Cloudinary (see settings) for real deployments.
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
