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
    user = User.objects.get(profile__authenticate_token=token)
    return user

def get_user_by_session_token(session_token):
    session = Session.objects.get(pk=session_token)
    s_data = session.get_decoded()
    user_id = s_data.get('_auth_user_id')
    user = User.objects.get(pk=user_id)
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

def force_login_by_session_token(request, session_token):
    user = get_user_by_session_token(session_token)
    force_login(request, user)
    
        
