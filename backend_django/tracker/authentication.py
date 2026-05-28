import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()


class JWTAuthentication(BaseAuthentication):
    """
    Custom DRF authentication backend that validates the Bearer JWT issued
    by the /auth/google endpoint.

    Expected header:
        Authorization: Bearer <token>

    Token payload (set in server/views.py google_auth):
        { "uid": <user.id>, "email": "...", "username": "..." }
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            # Not our scheme — let other authenticators try
            return None

        token = auth_header.split(" ", 1)[1].strip()
        if not token:
            return None

        try:
            payload = jwt.decode(
                token,
                settings.APP_JWT_SECRET,
                algorithms=["HS256"],
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f"Invalid token: {e}")

        user_id = payload.get("uid")
        if not user_id:
            raise AuthenticationFailed("Token payload missing 'uid'.")

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found.")

        # Return (user, token) — DRF sets request.user = user
        return (user, token)

    def authenticate_header(self, request):
        """Returned in WWW-Authenticate header on 401 responses."""
        return "Bearer"
