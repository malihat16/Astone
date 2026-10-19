#!/bin/sh
# Local development entrypoint used by docker-compose.
set -e

echo "Applying database migrations"
python manage.py migrate --noinput

# Create an admin account from DJANGO_SUPERUSER_* variables (skipped if it already exists).
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py createsuperuser --noinput || true
fi

python manage.py runserver 0.0.0.0:8000
