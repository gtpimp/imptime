import logging
from user_serializer import UserSerializer
from mailqueue.mailqueue_helper import queue_email
from rest_framework.decorators import list_route
from django.conf import settings
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import UserAutoLoginToken
from rest_framework.authtoken import views as rest_views
from rest_framework.authtoken.models import Token
from rest_framework.response import Response

logger = logging.getLogger(__name__)

class LoginViewSet(rest_views.ObtainAuthToken):
    
    def post(self, request, *args, **kwargs):
        # cut and pasted from venv/lib/python2.7/site-packages/rest_framework/authtoken/views.py

        username = request.data['username']
        if not User.objects.filter(username=username).exists():
            user_by_email = User.objects.filter(email=username).first()
            if user_by_email:
                request.data['username'] = user_by_email.username
        
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key,
                         'user_id': user.id,
                         'has_usable_password': user.has_usable_password()})

@permission_classes((IsAuthenticated,))
class AuthViewSet(BaseViewSet):

    @list_route(methods=['POST'])
    def change_password(self, request):
        password = request.data['password']
        user = request.user
        user.set_password(password)
        user.save()
        return Response({'status': 'success'})

@permission_classes(())
class AutoLoginViewSet(BaseViewSet):
    
    def create(self, request):
        return self._auto_login(request)
    
    def _auto_login(self, request):
        user = request.user
        token = request.data['token']
        user = UserAutoLoginToken.check_and_use_auto_login(token)
        if user is None:
            if request.user.is_authenticated():
                logger.debug("Couldn't auto-login, so staying as already logged in user")
                user = request.user
            else:
                raise Exception("Can't login, token either invalid, already used or expired")
        token, created = Token.objects.get_or_create(user=user)
        return Response({'username': user.username,
                         'token': token.key,
                         'user_id': user.id,
                         'has_usable_password': user.has_usable_password()})

    @list_route(methods=['POST'])
    def forgot_password(self, request):
        username = request.data['username']
        user = User.objects.filter(username=username).first()
        if user is None:
            raise Exception("Unknown username")
        user.set_unusable_password()
        user.save()

        content = """

        Your password has been reset, click the link below to choose a new one:

        {LOGIN_LINK}

        """
            
        auto_login_token = UserAutoLoginToken.get_auto_login_token(user)
            
        content = content.format(LOGIN_LINK=settings.WEB_URL_BASE + "?autologin="+auto_login_token)

        queue_email(subject_content="ImpTime: Reset password",
                    from_address=settings.FROM_EMAIL,
                    text_content=content,
                    html_content=content.replace("\n","<br/>"),
                    to_addresses=[user.email])
        
        return Response({'status': 'success'})
    
