from django import forms
# from core.models import *

from django.contrib.auth.forms import (
    AuthenticationForm, PasswordChangeForm, PasswordResetForm, SetPasswordForm,
)


class ImpAuthenticationForm(AuthenticationForm):
    username = forms.CharField(label="Username", widget=forms.TextInput(attrs={'placeholder': 'username', 'class': 'centred_placeholder'}))
    password = forms.CharField(label="Password", widget=forms.PasswordInput(attrs={'placeholder': 'password', 'class': 'centred_placeholder'}))
