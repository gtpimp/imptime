from django import forms
from django.forms import widgets
from django.utils.safestring import mark_safe

class UserModelChoiceField(forms.ModelChoiceField):
    def label_from_instance(self, obj):
        return obj.get_full_name()


