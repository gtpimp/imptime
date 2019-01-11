import logging
from user_serializer import UserSerializer
from impasync.refresh_notifier import RefreshNotifier
from mailqueue.mailqueue_helper import queue_email
from rest_framework.decorators import list_route
from django import template
from django.conf import settings
from django.db.models import Q
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import UserAutoLoginToken, User, UserProfile, UserOtpToken
from rest_framework.authtoken import views as rest_views
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.db.transaction import atomic

logger = logging.getLogger(__name__)

class LoginViewSet(rest_views.ObtainAuthToken):
    
    def post(self, request, *args, **kwargs):
        # cut and pasted from venv/lib/python2.7/site-packages/rest_framework/authtoken/views.py

        username = request.data.get('username', None)
        mobile_phone_number = request.data.get('mobile_phone_number', None)
        user = User.objects.filter(Q(username=username) | Q(email=username)).first()
        if user.username != username:
            request.data['username'] = user.username
        
        serializer = self.serializer_class(data=request.data)
        is_valid = serializer.is_valid(raise_exception=False)
        otp = request.data.get('password', None)
        if not is_valid and otp is not None:
            is_valid_otp = UserOtpToken.is_valid_otp(user, otp)
            if not is_valid_otp:
                return Response({'success': 'failed'})
        Token.objects.filter(user=user).delete()
        if mobile_phone_number and user:
            user.update(mobile_phone_number=mobile_phone_number)
            user.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key,
                         'user_id': user.id,
                         'is_superuser': user.is_superuser,
                         'has_usable_password': user.has_usable_password(),
                         'is_onboarded': user.profile.is_onboarded})

class OtpEmailViewSet(rest_views.ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username', None)
        user = User.objects.filter(email=username).first()
        if user is None:
            user_by_email = User.objects.filter(email=username).first()
            if user_by_email:
                user = user_by_email

        if user:
            otp = UserOtpToken.get_otp_token(user)
            email_context = {
                'otp': otp
            }
            html_template = template.loader.get_template("imptime/emails/email_otp.html")
            plain_template = template.loader.get_template("imptime/emails/email_otp.txt")
            html_content = html_template.render(email_context)
            plain_content = plain_template.render(email_context)
            queue_email(subject_content="Your login OTP is %s" % otp,
                        from_address=settings.FROM_EMAIL,
                        text_content=plain_content,
                        html_content=html_content,
                        to_addresses=[user.email])
        return Response({'success': 'ok'})

    
@permission_classes((IsAuthenticated,))
class AuthViewSet(BaseViewSet):

    @list_route(methods=['POST'])
    def update_profile(self, request):
        first_name = request.data.get('first_name', None)
        last_name = request.data.get('last_name', None)
        mobile_phone_number = request.data.get('mobile_phone_number')
        context = {}
        user = request.user
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if mobile_phone_number is not None:
            profile = user.profile
            profile.mobile_phone_number = mobile_phone_number
            profile.save()
        user.save()
        context['status'] = 'success'
        RefreshNotifier().notify_model_update(user)
        return Response(context)

    @list_route(methods=['POST'])
    def onboarded(self, request):
        context = {}
        user = request.user
        profile = user.profile
        profile.is_onboarded = True
        profile.save()
        context['status'] = 'success'
        response = RefreshNotifier().notify_model_update(user)
        return response
    
    @list_route(methods=['POST'])
    def change_password(self, request):
        new_password = request.data.get('new_password', None)
        old_password = request.data.get('old_password', None)
        first_name = request.data.get('first_name', None)
        last_name = request.data.get('last_name', None)
        context = {}
        user = request.user
        if user.has_usable_password() and (old_password and not user.check_password(old_password)):
            context['status'] = 'failure'
            context['error'] = 'Incorrect password'
        else:
            if new_password is not None:
                user.set_password(new_password)
            if first_name is not None:
                user.first_name = first_name
            if last_name is not None:
                user.last_name = last_name
            user.save()
            context['status'] = 'success'
            RefreshNotifier().notify_model_update(user)
        return Response(context)


    
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

        from project_api import ProjectViewSet
        ProjectViewSet.auto_create_self_project(user)
        
        return Response({'username': user.username,
                         'token': token.key,
                         'user_id': user.id,
                         'is_superuser': user.is_superuser,
                         'has_usable_password': user.has_usable_password()})

    @list_route(methods=['POST'])
    def forgot_password(self, request):
        username = request.data['username']
        user = User.objects.filter(Q(username=username)|Q(email=username)).first()
        if user is None:
            raise Exception("Unknown username")
        user.set_unusable_password()
        user.save()

        plain_content = """

        Your password has been reset, click the link below to choose a new one:

        {LOGIN_LINK}

        """

        html_content = """
        Your password has been reset, click the link below to choose a new one:
        <br/>
        <a href="{LOGIN_LINK}">{LOGIN_LINK}</a>

        """
            
        auto_login_token = UserAutoLoginToken.get_auto_login_token(user)

        login_link = settings.WEB_URL_BASE + "password/change?autologin="+auto_login_token
        plain_content = plain_content.format(LOGIN_LINK=login_link)
        html_content = html_content.format(LOGIN_LINK=login_link)

        queue_email(subject_content="ImpTime: Reset password",
                    from_address=settings.FROM_EMAIL,
                    text_content=plain_content,
                    html_content=html_content,
                    to_addresses=[user.email])
        
        return Response({'status': 'success'})

    @list_route(methods=['POST'])
    @atomic
    def create_account(self, request):
        context = {}
        email = request.data['email']
        user = User.objects.filter(email=email).first()
        if user is not None:
            context['status'] = 'success'
        else:
            user = User.objects.create(email=email,
                                       username=email)
            UserProfile.objects.create(user=user)
            user.set_unusable_password()
            user.save()

            otp = UserOtpToken.get_otp_token(user)
            email_context = {'otp': otp}

            plain_template = template.loader.get_template("imptime/emails/new_account.txt")
            html_template = template.loader.get_template("imptime/emails/new_account.html")
            plain_content = plain_template.render(email_context)
            html_content = html_template.render(email_context)
            
            queue_email(subject_content="Account created, your OTP is %s" % otp,
                        from_address=settings.FROM_EMAIL,
                        text_content=plain_content,
                        html_content=html_content,
                        to_addresses=[user.email],
                        bcc_addresses=[v for k,v in settings.CUSTOMER_SERVICE_EMAILS])
            context['status'] = 'success'
            
        return Response(context)
    
