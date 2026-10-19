"""
Django settings for the Astoné API.

Everything that differs between your laptop and production comes from
environment variables (see .env.example). Nothing secret lives in this file.
"""
import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()
env_file = BASE_DIR / '.env'
if env_file.exists():
    environ.Env.read_env(env_file)

# --- Core -------------------------------------------------------------------

SECRET_KEY = env('DJANGO_SECRET_KEY', default='django-insecure-dev-only-change-me')
DEBUG = env.bool('DJANGO_DEBUG', default=False)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS_DEPLOY', default=['localhost', '127.0.0.1'])

# Where the React app lives; used to build links in password-reset emails.
FRONTEND_URL = env('FRONTEND_URL', default='https://astone-frontend.vercel.app').rstrip('/')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
    'astoneapp',
    'rest_framework',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be above CommonMiddleware
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # serves admin CSS/JS in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'astone.urls'
WSGI_APPLICATION = 'astone.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# --- API & auth -------------------------------------------------------------

REST_FRAMEWORK = {
    # Understands both seller tokens and customer tokens (see astoneapp/auth.py).
    'DEFAULT_AUTHENTICATION_CLASSES': ['astoneapp.auth.AstoneJWTAuthentication'],
    # Endpoints are locked down by default; public ones opt in with AllowAny.
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

PASSWORD_RESET_MAX_AGE = 60 * 60 * 24  # reset links work for 24 hours

AUTHENTICATION_BACKENDS = ('django.contrib.auth.backends.ModelBackend',)

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- CORS / CSRF ------------------------------------------------------------
# Add your Vercel URL to CORS_ALLOWED_ORIGINS_DEPLOY, e.g. https://astone.vercel.app

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS_DEPLOY', default=['http://localhost:5173', 'http://localhost:3000'])
# Optional regex, e.g. ^https://astone-.*\.vercel\.app$ to allow Vercel preview deployments
CORS_ALLOWED_ORIGIN_REGEXES = env.list('CORS_ALLOWED_ORIGIN_REGEXES', default=[])
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS_DEPLOY', default=['http://localhost:8000'])

# Render/Heroku-style proxies terminate HTTPS before Django.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# --- Database ---------------------------------------------------------------

DATABASES = {
    'default': dj_database_url.parse(env('DATABASE_URL'), conn_max_age=600)
}
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- Static & media files ---------------------------------------------------

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage'},
}

# Render's disk is wiped on every deploy, so uploaded product photos disappear.
# Set the three CLOUDINARY_* variables and uploads go to Cloudinary instead.
if env('CLOUDINARY_CLOUD_NAME', default='') and env('CLOUDINARY_API_SECRET', default=''):
    INSTALLED_APPS += ['cloudinary_storage', 'cloudinary']
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': env('CLOUDINARY_CLOUD_NAME'),
        'API_KEY': env('CLOUDINARY_API_KEY'),
        'API_SECRET': env('CLOUDINARY_API_SECRET'),
    }
    STORAGES['default'] = {'BACKEND': 'cloudinary_storage.storage.MediaCloudinaryStorage'}

# --- Email ------------------------------------------------------------------

EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default=EMAIL_HOST_USER or 'no-reply@astone.local')
if EMAIL_HOST_PASSWORD:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = env('EMAIL_HOST', default='smtp.gmail.com')
    EMAIL_PORT = env.int('EMAIL_PORT', default=587)
    EMAIL_USE_TLS = True
else:
    # No mail server configured: print emails (with reset links) to the console instead.
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# --- Misc -------------------------------------------------------------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {'console': {'class': 'logging.StreamHandler'}},
    'root': {'handlers': ['console'], 'level': 'INFO'},
}
