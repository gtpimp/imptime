from rest_framework import authentication, exceptions, status
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User

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
    #session = Session.objects.get(pk=request.COOKIES['sessionid'])
    #s_data = session.get_decoded()
    #user_id = s_data.get('_auth_user_id')
    #user = User.objects.get(pk=user_id, profile__authenticate_token=token)
    user = User.objects.get(profile__authenticate_token=token)
    return user
