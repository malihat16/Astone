"""
API tests. Run with:  python manage.py test astoneapp
They focus on who is allowed to do what, because that is where the old API was weakest.
"""
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.core import mail
from django.utils import timezone
from rest_framework.test import APIClient, APITestCase

from astoneapp.auth import make_reset_token
from astoneapp.models.order import Order, OrderItem
from astoneapp.models.product import Product
from astoneapp.models.promotion import Promotion
from astoneapp.models.seller import Seller
from astoneapp.models.todo import Todo
from astoneapp.models.user import CustomUser

PASSWORD = 'correct-horse-9'


def make_seller(email='shop@example.com', shop='Shop'):
    user = User.objects.create_user(username=email, email=email, password=PASSWORD, first_name='Sam')
    seller = Seller.objects.create(user=user, gender='other', phone_number=60123456789, address='KL', shop_name=shop)
    Todo.objects.create(seller=seller)
    return seller


def make_customer(email='amy@example.com', points=0):
    return CustomUser.objects.create(email=email, first_name='Amy', password=make_password(PASSWORD), points=points)


def make_product(seller, **kwargs):
    defaults = dict(name='Tee', description='Cotton tee', category='Top', colors=[{'name': 'Black', 'hex': '#000000'}],
                    sizes=[{'value': 'M', 'label': 'Medium'}], price=Decimal('50.00'), original_price=Decimal('50.00'),
                    stock=10, brand='Astone', gender='U')
    defaults.update(kwargs)
    return Product.objects.create(seller=seller, **defaults)


class AuthHelpers:
    def customer_client(self, customer):
        client = APIClient()
        res = client.post('/login/', {'email': customer.email, 'password': PASSWORD}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
        return client

    def seller_client(self, seller):
        client = APIClient()
        res = client.post('/seller/token/', {'username': seller.user.username, 'password': PASSWORD}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
        return client


class CustomerAccountTests(AuthHelpers, APITestCase):
    def test_register_returns_tokens_and_hashes_password(self):
        res = self.client.post('/register/', {'email': 'New@Example.com', 'password': PASSWORD, 'first_name': 'N'}, format='json')
        self.assertEqual(res.status_code, 201)
        self.assertIn('access', res.data)
        user = CustomUser.objects.get(email='new@example.com')
        self.assertNotEqual(user.password, PASSWORD)

    def test_login_rejects_wrong_password(self):
        make_customer()
        res = self.client.post('/login/', {'email': 'amy@example.com', 'password': 'nope'}, format='json')
        self.assertEqual(res.status_code, 401)

    def test_profile_requires_login(self):
        self.assertEqual(self.client.get('/me/').status_code, 401)

    def test_customer_cannot_give_themselves_points_or_change_email(self):
        customer = make_customer(points=5)
        client = self.customer_client(customer)
        res = client.patch('/me/', {'points': 99999, 'email': 'evil@example.com', 'first_name': 'Amelia'}, format='json')
        self.assertEqual(res.status_code, 200)
        customer.refresh_from_db()
        self.assertEqual(customer.points, 5)
        self.assertEqual(customer.email, 'amy@example.com')
        self.assertEqual(customer.first_name, 'Amelia')

    def test_old_email_based_endpoints_are_gone(self):
        make_customer()
        self.assertEqual(self.client.get('/user/amy@example.com/').status_code, 404)

    def test_token_refresh_keeps_customer_identity(self):
        customer = make_customer()
        tokens = self.client.post('/login/', {'email': customer.email, 'password': PASSWORD}, format='json').data
        res = self.client.post('/token/refresh/', {'refresh': tokens['refresh']}, format='json')
        self.assertEqual(res.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
        self.assertEqual(self.client.get('/me/').data['email'], customer.email)


class PasswordResetTests(APITestCase):
    def test_reset_link_contains_signed_token_not_id(self):
        customer = make_customer()
        res = self.client.post('/forgot-password/', {'email': customer.email}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertNotIn(f'/ChangePassword/{customer.id}/', mail.outbox[0].body)

    def test_unknown_email_gets_same_answer(self):
        res = self.client.post('/forgot-password/', {'email': 'nobody@example.com'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_cannot_change_password_by_guessing_id(self):
        customer = make_customer()
        res = self.client.post('/change-password/', {'token': str(customer.id), 'password': 'new-password-1'}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_valid_token_changes_password_once(self):
        customer = make_customer()
        token = make_reset_token('customer', customer)
        res = self.client.post('/change-password/', {'token': token, 'password': 'new-password-1'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(self.client.post('/login/', {'email': customer.email, 'password': 'new-password-1'}, format='json').status_code, 200)
        again = self.client.post('/change-password/', {'token': token, 'password': 'another-pass-2'}, format='json')
        self.assertEqual(again.status_code, 400)

    def test_seller_token_does_not_work_for_customer_reset(self):
        seller = make_seller()
        token = make_reset_token('seller', seller.user)
        res = self.client.post('/change-password/', {'token': token, 'password': 'new-password-1'}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_seller_reset_flow(self):
        seller = make_seller()
        token = make_reset_token('seller', seller.user)
        res = self.client.post('/seller/seller-change-password/', {'token': token, 'password': 'new-password-1'}, format='json')
        self.assertEqual(res.status_code, 200)
        seller.user.refresh_from_db()
        self.assertTrue(seller.user.check_password('new-password-1'))


class CartAndOrderTests(AuthHelpers, APITestCase):
    def setUp(self):
        self.seller = make_seller()
        self.product = make_product(self.seller)
        self.amy = make_customer(points=20)
        self.bob = make_customer('bob@example.com')

    def test_cart_requires_login(self):
        self.assertEqual(self.client.get('/cart/').status_code, 401)

    def test_seller_token_cannot_use_cart(self):
        client = self.seller_client(self.seller)
        self.assertEqual(client.get('/cart/').status_code, 403)

    def test_add_update_and_carts_are_private(self):
        amy = self.customer_client(self.amy)
        res = amy.post(f'/add_to_cart/{self.product.id}/', {'size': 'M', 'color': '#000000', 'quantity': 2}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['item_count'], 2)

        bob = self.customer_client(self.bob)
        self.assertEqual(bob.get('/cart/').data['item_count'], 0)

        res = amy.post(f'/update_cart/{self.product.id}/', {'size': 'M', 'color': '#000000', 'quantity': 0}, format='json')
        self.assertEqual(res.data['item_count'], 0)

    def test_cannot_add_more_than_stock(self):
        amy = self.customer_client(self.amy)
        res = amy.post(f'/add_to_cart/{self.product.id}/', {'size': 'M', 'color': '#000000', 'quantity': 11}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_place_order_applies_points_stock_and_seller_todo(self):
        amy = self.customer_client(self.amy)
        amy.post(f'/add_to_cart/{self.product.id}/', {'size': 'M', 'color': '#000000', 'quantity': 2}, format='json')
        res = amy.post('/place_order/', {'address': '1 Jalan Ampang', 'points_to_use': 20}, format='json')
        self.assertEqual(res.status_code, 201, res.data)

        order = Order.objects.get(id=res.data['order_id'])
        self.assertEqual(order.total_price, Decimal('80.00'))  # 100 - 20 points
        self.amy.refresh_from_db()
        self.assertEqual(self.amy.points, 8)  # 20 - 20 + 10% of 80
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 8)
        self.assertEqual(OrderItem.objects.get(order=order).seller, self.seller)
        self.assertEqual(Todo.objects.get(seller=self.seller).to_processed_shipment, 1)
        self.assertEqual(amy.get('/cart/').data['item_count'], 0)

    def test_cannot_overspend_points(self):
        amy = self.customer_client(self.amy)
        amy.post(f'/add_to_cart/{self.product.id}/', {'size': 'M', 'color': '#000000'}, format='json')
        res = amy.post('/place_order/', {'address': 'x', 'points_to_use': 500}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_empty_cart_cannot_be_ordered(self):
        amy = self.customer_client(self.amy)
        self.assertEqual(amy.post('/place_order/', {'address': 'x'}, format='json').status_code, 400)

    def test_orders_are_private(self):
        amy = self.customer_client(self.amy)
        amy.post(f'/add_to_cart/{self.product.id}/', {'size': 'M', 'color': '#000000'}, format='json')
        order_id = amy.post('/place_order/', {'address': 'x'}, format='json').data['order_id']

        self.assertEqual(amy.get(f'/order/{order_id}/').status_code, 200)
        self.assertEqual(len(amy.get('/orders/').data), 1)
        bob = self.customer_client(self.bob)
        self.assertEqual(bob.get(f'/order/{order_id}/').status_code, 404)
        self.assertEqual(self.client.get(f'/order/{order_id}/').status_code, 401)


class SellerProductTests(AuthHelpers, APITestCase):
    def setUp(self):
        self.seller = make_seller()
        self.other = make_seller('other@example.com', 'Other')
        self.product = make_product(self.seller)

    def test_catalogue_is_public_and_filters_by_gender(self):
        make_product(self.seller, name='Dress', gender='F')
        self.assertEqual(len(self.client.get('/products/').data), 2)
        self.assertEqual([p['name'] for p in self.client.get('/products/?gender=f').data], ['Dress'])
        self.assertEqual(self.client.get(f'/products/{self.product.id}/').status_code, 200)

    def test_anonymous_and_customers_cannot_delete(self):
        self.assertEqual(self.client.delete(f'/products/{self.product.id}/').status_code, 401)
        customer = self.customer_client(make_customer())
        self.assertEqual(customer.delete(f'/products/{self.product.id}/').status_code, 403)

    def test_other_seller_cannot_edit_or_delete(self):
        other = self.seller_client(self.other)
        self.assertEqual(other.delete(f'/products/{self.product.id}/').status_code, 403)
        self.assertEqual(other.patch(f'/products/{self.product.id}/edit', {'name': 'Hacked'}, format='json').status_code, 403)
        self.assertTrue(Product.objects.filter(id=self.product.id, name='Tee').exists())

    def test_owner_can_edit_and_delete(self):
        owner = self.seller_client(self.seller)
        res = owner.patch(f'/products/{self.product.id}/edit', {'price': '60.00', 'stock': 3}, format='json')
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data['original_price'], '60.00')
        self.assertEqual(owner.delete(f'/products/{self.product.id}/').status_code, 204)

    def test_seller_creates_product(self):
        owner = self.seller_client(self.seller)
        res = owner.post('/auth_products/', {
            'name': 'Hoodie', 'description': 'Warm', 'category': 'Top', 'colors': '[{"name": "Red", "hex": "#FF0000"}]',
            'sizes': '[{"value": "L", "label": "Large"}]', 'currency': 'MYR', 'price': '120.00', 'stock': 5,
            'rating': 0, 'brand': 'Astone', 'gender': 'M',
        }, format='multipart')
        self.assertEqual(res.status_code, 201, res.data)
        product = Product.objects.get(name='Hoodie')
        self.assertEqual(product.seller, self.seller)
        self.assertEqual(product.original_price, Decimal('120.00'))
        self.assertEqual(product.colors[0]['hex'], '#FF0000')
        self.assertEqual(len(owner.get('/auth_products/').data), 2)

    def test_promotion_sets_and_restores_price(self):
        owner = self.seller_client(self.seller)
        start = timezone.now()
        res = owner.post('/promotions/', {'product': self.product.id, 'discount_percentage': '20',
                                          'start_date': start.isoformat(), 'end_date': (start + timedelta(days=3)).isoformat()}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        self.product.refresh_from_db()
        self.assertEqual(self.product.price, Decimal('40.00'))

        promo = Promotion.objects.get(product=self.product)
        other = self.seller_client(self.other)
        self.assertEqual(other.delete(f'/promotions/{promo.id}/delete/').status_code, 403)
        self.assertEqual(owner.delete(f'/promotions/{promo.id}/delete/').status_code, 204)
        self.product.refresh_from_db()
        self.assertEqual(self.product.price, Decimal('50.00'))

    def test_other_seller_cannot_add_promotion(self):
        other = self.seller_client(self.other)
        start = timezone.now()
        res = other.post('/promotions/', {'product': self.product.id, 'discount_percentage': '50',
                                          'start_date': start.isoformat(), 'end_date': (start + timedelta(days=1)).isoformat()}, format='json')
        self.assertEqual(res.status_code, 403)


class SellerAccountTests(AuthHelpers, APITestCase):
    def test_register_and_login(self):
        res = self.client.post('/seller/register/', {
            'user': {'username': 'new@shop.com', 'email': 'new@shop.com', 'password': PASSWORD, 'first_name': 'N', 'last_name': 'S'},
            'gender': 'female', 'phone_number': 60123456789, 'address': 'KL', 'shop_name': 'New Shop',
        }, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        seller = Seller.objects.get(shop_name='New Shop')
        self.assertTrue(Todo.objects.filter(seller=seller).exists())
        self.seller_client(seller)

    def test_customer_cannot_get_seller_token(self):
        make_customer()
        res = self.client.post('/seller/token/', {'username': 'amy@example.com', 'password': PASSWORD}, format='json')
        self.assertEqual(res.status_code, 401)

    def test_seller_profile_is_private(self):
        seller, other = make_seller(), make_seller('o@example.com', 'O')
        client = self.seller_client(seller)
        self.assertEqual(client.get('/seller/me/').data['shop_name'], 'Shop')
        self.assertEqual(client.get(f'/seller/{other.id}/').status_code, 403)
        self.assertEqual(self.client.get(f'/seller/{seller.id}/').status_code, 401)

    def test_shop_name_must_be_unique(self):
        seller, _ = make_seller(), make_seller('o@example.com', 'Taken')
        client = self.seller_client(seller)
        self.assertEqual(client.patch('/seller/me/', {'shop_name': 'Taken'}, format='json').status_code, 400)
        self.assertEqual(client.patch('/seller/me/', {'shop_name': 'Fresh', 'user': {'first_name': 'Sue'}}, format='json').status_code, 200)

    def test_ship_order_item(self):
        seller = make_seller()
        product = make_product(seller)
        customer = make_customer()
        customer_client = self.customer_client(customer)
        customer_client.post(f'/add_to_cart/{product.id}/', {'size': 'M', 'color': '#000000', 'quantity': 2}, format='json')
        customer_client.post('/place_order/', {'address': 'x'}, format='json')

        client = self.seller_client(seller)
        rows = client.get('/seller/orders/').data
        self.assertEqual(len(rows), 1)
        res = client.post(f"/seller/orders/{rows[0]['id']}/ship/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['to_processed_shipment'], 0)
        self.assertEqual(res.data['processed_shipment'], 1)
        self.assertEqual(res.data['sold_product'], 2)
        self.assertEqual(client.get('/seller/orders/').data, [])
        self.assertEqual(len(client.get('/seller/orders/?all=1').data), 1)
        self.assertEqual(client.post(f"/seller/orders/{rows[0]['id']}/ship/").status_code, 400)

        other = self.seller_client(make_seller('o@example.com', 'O'))
        self.assertEqual(other.post(f"/seller/orders/{rows[0]['id']}/ship/").status_code, 404)
