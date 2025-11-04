import os
import json
import jwt
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from google.oauth2 import id_token
from google.auth.transport import requests
from .settings import GOOGLE_CLIENT_ID, APP_JWT_SECRET

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

        user = {
            'id': payload['sub'],
            'email': payload['email'],
            'name': payload.get('name', ''),
            'picture': payload.get('picture', ''),
        }

        token = jwt.encode({'uid': user['id'], 'email': user['email']}, APP_JWT_SECRET, algorithm='HS256')
        return JsonResponse({'token': token, 'user': user})
    except ValueError:
        return JsonResponse({'message': 'Invalid Google ID token'}, status=401)
    except Exception as e:
        return JsonResponse({'message': 'Auth error'}, status=500)
