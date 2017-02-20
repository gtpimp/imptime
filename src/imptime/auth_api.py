import logging
from user_serializer import UserSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
# from timepiece.models import Business as User
# from timepiece.models import User as Sprint
from rest_framework.authtoken import views as rest_views
from rest_framework.authtoken.models import Token
from rest_framework.response import Response


logger = logging.getLogger(__name__)


class AuthViewSet(rest_views.ObtainAuthToken):

    def post(self, request, *args, **kwargs):
        # cut and pasted from venv/lib/python2.7/site-packages/rest_framework/authtoken/views.py
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key,
                         'user_id': user.id})
