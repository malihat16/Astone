import logging

from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..auth import IsCustomer, tokens_for_customer, make_reset_token, read_reset_token
from ..models.user import CustomUser
from ..serializers.user_serializer import (
    UserSerializer, UserForgotPasswordSerializer, UserChangePasswordSerializer,
)

logger = logging.getLogger(__name__)

RESET_SENT_MESSAGE = 'If an account with that email exists, a reset link is on its way.'


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    email = (request.data.get('email') or '').strip().lower()
    password = request.data.get('password') or ''

    if not email or not password:
        return Response({'detail': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(password) < 8:
        return Response({'detail': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
    if CustomUser.objects.filter(email__iexact=email).exists():
        return Response({'detail': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.create(
        email=email,
        first_name=request.data.get('first_name') or '',
        last_name=request.data.get('last_name') or '',
        gender=request.data.get('gender') or None,
        phone_number=request.data.get('phone_number') or None,
        address=request.data.get('address') or None,
        password=make_password(password),
    )
    return Response(
        {'user': UserSerializer(user).data, **tokens_for_customer(user)},
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = (request.data.get('email') or '').strip()
    password = request.data.get('password') or ''

    if not email or not password:
        return Response({'detail': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = CustomUser.objects.filter(email__iexact=email).first()
    if user is None or not check_password(password, user.password):
        return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({'user': UserSerializer(user).data, **tokens_for_customer(user)})


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsCustomer])
def me(request):
    """The logged-in customer's own profile."""
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)

    serializer = UserSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    serializer = UserForgotPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data['email']

    user = CustomUser.objects.filter(email__iexact=email).first()
    if user:
        link = f"{settings.FRONTEND_URL}/ChangePassword/{make_reset_token('customer', user)}"
        try:
            send_mail(
                subject='Reset your Astoné password',
                message=f'Use this link to choose a new password: {link}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=f"<p>Use this link to choose a new password:</p><p><a href=\"{link}\">{link}</a></p>"
                             f"<p>The link expires in 24 hours.</p>",
            )
        except Exception:  # don't reveal mail problems (or whether the account exists)
            logger.exception('Could not send password reset email')

    # Same answer either way, so the form can't be used to find out who has an account.
    return Response({'detail': RESET_SENT_MESSAGE})


@api_view(['POST'])
@permission_classes([AllowAny])
def change_password(request):
    serializer = UserChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = read_reset_token('customer', serializer.validated_data['token'], CustomUser)
    if user is None:
        return Response({'detail': 'This reset link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

    user.password = make_password(serializer.validated_data['password'])
    user.save(update_fields=['password'])
    return Response({'detail': 'Your password has been changed. You can log in now.'})
