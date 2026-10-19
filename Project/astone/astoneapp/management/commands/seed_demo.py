"""
Fill an empty database with a demo catalogue, a demo seller and a demo customer.

    python manage.py seed_demo

Safe to run more than once: it skips anything that already exists.
Demo logins (change or delete them before a real launch):
    customer  demo@astone.my    / astone-demo-1
    seller    seller@astone.my  / astone-demo-1
"""
from datetime import timedelta
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.core.files import File
from django.core.management.base import BaseCommand
from django.utils import timezone

from astoneapp.models.image import Image
from astoneapp.models.product import Product
from astoneapp.models.promotion import Promotion
from astoneapp.models.seller import Seller
from astoneapp.models.todo import Todo
from astoneapp.models.user import CustomUser

DEMO_PASSWORD = 'astone-demo-1'
IMAGES = Path(settings.BASE_DIR) / 'seed_images'
SIZES = [{'value': s, 'label': l} for s, l in [('XS', 'Extra small'), ('S', 'Small'), ('M', 'Medium'), ('L', 'Large'), ('XL', 'Extra large')]]

CATALOGUE = [
    # name, description, gender, brand, price, colour name, hex, images, discount %
    ('Everyday Crew Tee', 'Mid-weight combed cotton with a relaxed shoulder. Holds its shape wash after wash.', 'U', 'Astoné Basics', '59.00', 'Chilli red', '#D8261E',
     ['tee-red-model-1.jpg', 'tee-red-model-2.jpg', 'tee-red-model-3.jpg', 'tee-red-model-4.jpg', 'tee-red.jpg'], 20),
    ('Relaxed V-Neck Tee', 'Soft slub jersey cut a little longer, with a shallow V that sits flat.', 'M', 'Pagi', '49.00', 'Charcoal', '#4A4A4D', ['vneck-charcoal.jpg'], None),
    ('Heavyweight Tee', '240 gsm cotton for a structured, boxy drape. Our thickest tee.', 'M', 'Astoné Basics', '69.00', 'Navy', '#1F2D4D', ['tee-navy.jpg'], None),
    ('Heavyweight Tee', '240 gsm cotton for a structured, boxy drape. Our thickest tee.', 'U', 'Astoné Basics', '69.00', 'Forest', '#2F4A3A', ['tee-forest.jpg'], None),
    ('Boxy Tee', 'Cropped body and dropped shoulders. Pairs well with high-rise trousers.', 'F', 'Kain Studio', '55.00', 'Sand', '#CDB48E', ['tee-sand.jpg'], None),
    ('Boxy Tee', 'Cropped body and dropped shoulders. Pairs well with high-rise trousers.', 'F', 'Kain Studio', '55.00', 'Lilac', '#B9A3D6', ['tee-lilac.jpg'], 15),
    ('Pocket Tee', 'Classic fit with a single chest pocket. Pre-shrunk so it stays true to size.', 'M', 'Pagi', '45.00', 'Black', '#232326', ['tee-black.jpg'], None),
    ('Oversized Tee', 'Generous fit with a long sleeve line. Size down for a closer fit.', 'U', 'Kain Studio', '62.00', 'Mustard', '#C99A2E', ['tee-mustard.jpg'], None),
    ('Cropped Tee', 'Short, slightly fitted body in breathable cotton-modal.', 'F', 'Kain Studio', '49.00', 'Rose', '#D98A9B', ['tee-rose.jpg'], 10),
    ('Linen-Blend Tee', 'Linen and cotton for hot days. Gets softer every wash.', 'U', 'Pagi', '79.00', 'Sky', '#8FB3D9', ['tee-sky.jpg'], None),
]


class Command(BaseCommand):
    help = 'Create a demo seller, customer and product catalogue.'

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username='seller@astone.my',
            defaults={'email': 'seller@astone.my', 'first_name': 'Nadia', 'last_name': 'Rahman'},
        )
        if created:
            user.set_password(DEMO_PASSWORD)
            user.save()
        seller, _ = Seller.objects.get_or_create(
            user=user, defaults={'gender': 'female', 'phone_number': 60123456789, 'address': 'Bangsar, Kuala Lumpur', 'shop_name': 'Astoné Studio'}
        )
        Todo.objects.get_or_create(seller=seller)

        CustomUser.objects.get_or_create(
            email='demo@astone.my',
            defaults={'first_name': 'Aina', 'last_name': 'Demo', 'password': make_password(DEMO_PASSWORD), 'points': 120,
                      'address': '12 Jalan Telawi, Bangsar, 59100 Kuala Lumpur'},
        )

        made = 0
        for name, description, gender, brand, price, colour, hex_code, images, discount in CATALOGUE:
            full_name = f'{name} – {colour}'[:30]
            if Product.objects.filter(name=full_name, seller=seller).exists():
                continue
            price = Decimal(price)
            product = Product.objects.create(
                seller=seller, name=full_name, description=description[:100], category='Top',
                colors=[{'name': colour, 'hex': hex_code}], sizes=SIZES, currency='MYR',
                price=price, original_price=price, stock=40, rating=4, brand=brand, gender=gender,
            )
            for filename in images:
                with open(IMAGES / filename, 'rb') as fh:
                    image = Image(product=product)
                    image.image_url.save(f'{product.id}-{filename}', File(fh), save=True)
            if discount:
                now = timezone.now()
                Promotion.objects.create(product=product, discount_percentage=Decimal(discount),
                                         start_date=now, end_date=now + timedelta(days=30))
                product.price = (price * (100 - Decimal(discount)) / 100).quantize(Decimal('0.01'))
                product.save(update_fields=['price'])
            made += 1

        self.stdout.write(self.style.SUCCESS(f'Demo data ready ({made} new products).'))
        self.stdout.write(f'Customer: demo@astone.my / {DEMO_PASSWORD}')
        self.stdout.write(f'Seller:   seller@astone.my / {DEMO_PASSWORD}')
