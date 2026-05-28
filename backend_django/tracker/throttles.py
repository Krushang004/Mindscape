from rest_framework.throttling import AnonRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """
    Stricter rate limit for sensitive auth endpoints:
      - POST /auth/google        (Google login)
      - POST /api/users/request_password_reset_otp/
      - POST /api/users/verify_password_reset_otp/
      - POST /api/users/reset_password/

    Rate is controlled by THROTTLE_RATE_AUTH env var (default: 10/hour).
    Keyed by IP address (same as AnonRateThrottle) so it applies even to
    unauthenticated requests.
    """
    scope = 'auth'
