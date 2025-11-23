import os
import json
import jwt
import urllib.parse
from django.http import JsonResponse, HttpResponseRedirect, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from .settings import GOOGLE_CLIENT_ID, APP_JWT_SECRET, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI

User = get_user_model()

@csrf_exempt
def google_auth(request):
    if request.method != 'POST':
        return JsonResponse({'message': 'Method not allowed'}, status=405)
    try:
        body = json.loads(request.body.decode('utf-8'))
        id_token_str = body.get('idToken')
        if not id_token_str:
            return JsonResponse({'message': 'Missing idToken'}, status=400)

        payload = id_token.verify_oauth2_token(id_token_str, requests.Request(), GOOGLE_CLIENT_ID)
        # Validate required fields
        if not payload.get('email_verified'):
            return JsonResponse({'message': 'Unverified Google account'}, status=401)

        google_id = payload['sub']
        email = payload['email']
        name = payload.get('name', '')
        picture = payload.get('picture', '')
        
        # Get or create user
        try:
            # Try to find user by Google ID first
            user = User.objects.get(google_id=google_id)
        except User.DoesNotExist:
            try:
                # Try to find user by email
                user = User.objects.get(email=email)
                # Update with Google ID
                user.google_id = google_id
                if picture and not user.profile_picture:
                    user.profile_picture = picture
                user.save()
            except User.DoesNotExist:
                # Create new user
                # Split name into first and last name
                name_parts = name.split(' ', 1) if name else ['', '']
                first_name = name_parts[0] if len(name_parts) > 0 else ''
                last_name = name_parts[1] if len(name_parts) > 1 else ''
                
                # Generate username from email
                username = email.split('@')[0]
                # Ensure username is unique
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    google_id=google_id,
                    profile_picture=picture if picture else None,
                    password=None  # Google users don't need password
                )
        
        # Generate JWT token
        token = jwt.encode(
            {'uid': user.id, 'email': user.email, 'username': user.username},
            APP_JWT_SECRET,
            algorithm='HS256'
        )
        
        user_data = {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'name': user.get_full_name() or name,
            'picture': user.profile_picture or picture,
        }
        
        return JsonResponse({'token': token, 'user': user_data})
    except ValueError as e:
        return JsonResponse({'message': 'Invalid Google ID token', 'error': str(e)}, status=401)
    except Exception as e:
        import traceback
        print(f"Google auth error: {traceback.format_exc()}")
        return JsonResponse({'message': 'Auth error', 'error': str(e)}, status=500)


@csrf_exempt
def google_oauth_redirect(request):
    """
    OAuth redirect handler that receives the authorization code from Google,
    exchanges it for tokens, and redirects to the app with the tokens.
    This endpoint uses HTTPS and can be registered with Google.
    """
    if request.method != 'GET':
        return JsonResponse({'message': 'Method not allowed'}, status=405)
    
    try:
        # Get authorization code from query params
        code = request.GET.get('code')
        error = request.GET.get('error')
        
        if error:
            error_description = request.GET.get('error_description', error)
            # Redirect to app with error using custom URL scheme
            app_redirect = f"mentalhealthtracker://auth?error={urllib.parse.quote(error_description)}"
            # Use HttpResponse with Location header to allow custom URL scheme
            response = HttpResponse(status=302)
            response['Location'] = app_redirect
            return response
        
        if not code:
            # Redirect to app with error
            app_redirect = "mentalhealthtracker://auth?error=No authorization code received"
            response = HttpResponse(status=302)
            response['Location'] = app_redirect
            return response
        
        # Exchange authorization code for tokens
        import requests as http_requests
        token_url = 'https://oauth2.googleapis.com/token'
        
        # Use configured redirect URI from settings (must match what frontend sent to Google)
        # Fallback to request.build_absolute_uri if not configured
        if GOOGLE_REDIRECT_URI:
            redirect_uri = GOOGLE_REDIRECT_URI
        else:
            # Fallback: use the request's absolute URI
            redirect_uri = request.build_absolute_uri('/auth/google/callback')
            # Remove any query parameters that might have been added
            if '?' in redirect_uri:
                redirect_uri = redirect_uri.split('?')[0]
            print(f"⚠️ WARNING: GOOGLE_REDIRECT_URI not set in settings. Using request URI: {redirect_uri}")
            print(f"⚠️ This may cause redirect_uri_mismatch errors if it doesn't match what the frontend sent!")
        
        # Debug logging
        print(f"OAuth Token Exchange:")
        print(f"  Redirect URI: {redirect_uri}")
        print(f"  Client ID: {GOOGLE_CLIENT_ID[:20]}..." if GOOGLE_CLIENT_ID else "  Client ID: MISSING!")
        print(f"  Client Secret: {'SET' if GOOGLE_CLIENT_SECRET else 'MISSING!'}")
        print(f"  Authorization Code: {code[:20]}..." if code else "  Authorization Code: MISSING!")
        
        token_data = {
            'code': code,
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
        }
        
        token_response = http_requests.post(token_url, data=token_data)
        
        # Better error handling
        if token_response.status_code != 200:
            error_text = token_response.text
            print(f"Token exchange failed: {token_response.status_code}")
            print(f"Error response: {error_text}")
            raise Exception(f"Token exchange failed: {token_response.status_code} - {error_text}")
        
        token_response.raise_for_status()
        tokens = token_response.json()
        
        access_token = tokens.get('access_token')
        id_token_str = tokens.get('id_token')
        
        if not id_token_str:
            app_redirect = "mentalhealthtracker://auth?error=No ID token received"
            response = HttpResponse(status=302)
            response['Location'] = app_redirect
            return response
        
        # Redirect to app with tokens in URL fragment (for security)
        # Format: mentalhealthtracker://auth#access_token=...&id_token=...
        params = {
            'access_token': access_token,
            'id_token': id_token_str,
            'expires_in': tokens.get('expires_in', 3600),
        }
        
        # Build redirect URL with fragment
        query_string = '&'.join([f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items()])
        app_redirect = f"mentalhealthtracker://auth#{query_string}"
        
        # Use HttpResponse with Location header to allow custom URL scheme
        # Django's HttpResponseRedirect blocks custom schemes, so we use HttpResponse directly
        response = HttpResponse(status=302)
        response['Location'] = app_redirect
        return response
        
    except Exception as e:
        import traceback
        print(f"OAuth redirect error: {traceback.format_exc()}")
        error_msg = urllib.parse.quote(str(e))
        app_redirect = f"mentalhealthtracker://auth?error={error_msg}"
        response = HttpResponse(status=302)
        response['Location'] = app_redirect
        return response
