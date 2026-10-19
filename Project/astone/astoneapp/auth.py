"""
Authentication for Astoné.

There are two kinds of account:

* Sellers use Django's built-in ``User`` model (plus a ``Seller`` profile).
  Their JWTs are issued by ``/seller/token/`` and carry the usual ``user_id``.
* Customers use ``CustomUser``. Their JWTs are issued by ``/login/`` and carry
  ``role: "customer"`` and ``customer_id`` instead of ``user_id``.

``AstoneJWTAuthentication`` understands both, so every endpoint can use
``request.user`` and the permission classes below decide who may do what.
"""
from django.conf import settings
from django.core import signing
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

from astoneapp.models.user import CustomUser

CUSTOMER_ROLE = "customer"


class AstoneJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        if validated_token.get("role") == CUSTOMER_ROLE:
            try:
                return CustomUser.objects.get(id=validated_token.get("customer_id"))
            except CustomUser.DoesNotExist:
                raise AuthenticationFailed("Customer not found", code="user_not_found")
        return super().get_user(validated_token)


def tokens_for_customer(customer):
    """Issue a refresh/access pair for a customer account."""
    refresh = RefreshToken()
    refresh["role"] = CUSTOMER_ROLE
    refresh["customer_id"] = customer.id
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


# --- permissions -----------------------------------------------------------

def is_customer(user):
    return isinstance(user, CustomUser)


def get_seller(user):
    """Return the Seller profile for a logged-in seller, or None."""
    if is_customer(user) or not getattr(user, "is_authenticated", False):
        return None
    return getattr(user, "seller", None)


class IsCustomer(BasePermission):
    message = "You need to be logged in as a customer."

    def has_permission(self, request, view):
        return is_customer(request.user)


class IsSeller(BasePermission):
    message = "You need to be logged in as a seller."

    def has_permission(self, request, view):
        return get_seller(request.user) is not None


# --- password reset tokens -------------------------------------------------
# A reset link contains a signed token rather than the bare account id.
# The token includes a fragment of the current password hash, so it stops
# working as soon as the password is changed (single use), and it expires
# after PASSWORD_RESET_MAX_AGE seconds.

_RESET_SALT = "astone.password-reset"


def make_reset_token(kind, account):
    return signing.dumps(
        {"k": kind, "id": account.pk, "p": account.password[-12:]},
        salt=_RESET_SALT,
    )


def read_reset_token(kind, token, model):
    """Return the account a reset token belongs to, or None if it is invalid."""
    try:
        data = signing.loads(
            token, salt=_RESET_SALT, max_age=settings.PASSWORD_RESET_MAX_AGE
        )
    except signing.BadSignature:  # includes SignatureExpired
        return None
    if data.get("k") != kind:
        return None
    account = model.objects.filter(pk=data.get("id")).first()
    if account is None or account.password[-12:] != data.get("p"):
        return None
    return account
