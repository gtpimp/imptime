from rest_framework import authentication, exceptions, status
from rest_framework.authtoken.models import Token

class FormTokenAuthenticated(authentication.TokenAuthentication):
    def authenticate(self, request):
        if request.method != 'POST':
            return None
        token = request.POST['http_authorization']
        if not token:
            return None

        return self.authenticate_credentials(token)
