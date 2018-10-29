from django.contrib.auth import login as django_login, load_backend
from django.conf import settings
from rest_framework import authentication, exceptions, status
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session

class FormTokenAuthenticated(authentication.TokenAuthentication):
    def authenticate(self, request):
        if request.method != 'POST':
            return None
        token = request.POST.get('http_authorization', None)
        if not token:
            return None

        return self.authenticate_credentials(token)

def get_user_by_token(request):
    token = request.GET['token']
    rest_token = Token.objects.get(key=token)
    user = rest_token.user
    return user

def force_login(request, user):
    if not hasattr(user, 'backend'):
        for backend in settings.AUTHENTICATION_BACKENDS:
            if user == load_backend(backend).get_user(user.pk):
                user.backend = backend
                break
    if hasattr(user, 'backend'):
        django_login(request, user)
    
def force_login_by_token(request):
    user = get_user_by_token(request)
    force_login(request, user)
 
