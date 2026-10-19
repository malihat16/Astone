# Astoné API (Django)

REST API for the Astoné shop and Seller Centre. Django 5 + Django REST Framework + PostgreSQL, with JWT logins for both shoppers and sellers.

## Setup

```bash
cp .env.example .env              # fill in DATABASE_URL and the rest
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo        # optional demo catalogue + logins
python manage.py runserver        # http://localhost:8000
```

With Docker instead: `docker-compose up` (uses `start.sh`, which also creates an admin from the `DJANGO_SUPERUSER_*` variables).

Admin site: `/admin/`. Create your own login with `python manage.py createsuperuser`.

## Layout

```
astone/settings.py        all configuration, read from environment variables
astone/urls.py            every API route, grouped by area
astoneapp/auth.py         JWT handling for shoppers and sellers, permission classes, reset tokens
astoneapp/models/         one file per model
astoneapp/serializers/    request/response shapes
astoneapp/views/          endpoints, grouped by area (products, cart, orders, users, sellers, promotions)
astoneapp/tests.py        API tests
astoneapp/management/commands/seed_demo.py   demo data
```

## Auth in one paragraph

Sellers are Django `User`s with a `Seller` profile; they log in at `/seller/token/`. Shoppers are `CustomUser`s; they log in at `/login/`, which returns a JWT with `role: "customer"`. `AstoneJWTAuthentication` understands both kinds of token, and the `IsCustomer` / `IsSeller` permission classes guard each endpoint. Endpoints are private by default (`IsAuthenticated`); public ones opt in with `AllowAny`. Both token types refresh at `/token/refresh/`.

## Main endpoints

| Area | Endpoint | Who |
| --- | --- | --- |
| Catalogue | `GET /products/?gender=M\|F\|U`, `GET /products/<id>/` | anyone |
| Shopper account | `POST /register/`, `POST /login/`, `GET/PATCH /me/` | shopper |
| Password reset | `POST /forgot-password/`, `POST /change-password/` (token + password) | anyone |
| Bag | `GET /cart/`, `POST /add_to_cart/<id>/`, `POST /update_cart/<id>/` | shopper |
| Orders | `POST /place_order/`, `GET /orders/`, `GET /order/<id>/` | shopper (own orders only) |
| Seller account | `POST /seller/register/`, `POST /seller/token/`, `GET/PATCH /seller/me/` | seller |
| Seller products | `GET/POST /auth_products/`, `PATCH /products/<id>/edit`, `DELETE /products/<id>/` | owning seller |
| Promotions | `POST /promotions/`, `DELETE /promotions/<id>/delete/` | owning seller |
| Shipping | `GET /seller/orders/?all=1`, `POST /seller/orders/<item>/ship/` | owning seller |

## Tests

```bash
python manage.py test astoneapp
```

The tests need a PostgreSQL `DATABASE_URL` (the same engine as production).
