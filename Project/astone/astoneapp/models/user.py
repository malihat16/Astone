from django.db import models


class CustomUser(models.Model):
    """A shopper account. Sellers use Django's built-in User model instead."""

    email = models.EmailField(max_length=255, unique=True)
    first_name = models.CharField(max_length=25, blank=True, null=False)
    last_name = models.CharField(max_length=25, blank=True, null=False)

    gender = models.CharField(max_length=10, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    password = models.CharField(max_length=512)

    points = models.IntegerField(default=0)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    # These let Django REST Framework treat a customer as a logged-in user
    # when they authenticate with a customer JWT.
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def __str__(self):
        return self.email
