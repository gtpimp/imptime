from django import forms
from django.forms import widgets
from django.utils.safestring import mark_safe

class UserModelChoiceField(forms.ModelChoiceField):
    def label_from_instance(self, obj):
        return obj.get_full_name()

    
class ButtonRadioInput(forms.widgets.RadioChoiceInput):

    def __init__(self, *args, **kwargs):
        super(ButtonRadioInput, self).__init__(*args, **kwargs)

    def __unicode__(self):
        return self.render()

    def render(self, name=None, value=None, attrs=None, choices=()):
        name = name or self.name
        value = value or self.value
        attrs = attrs or self.attrs
        if 'id' in self.attrs:
            label_for = ' for="%s"' % (self.id_for_label)
        else:
            label_for = ''
        choice_label = self.choice_label
        return mark_safe(u'<div class="button_radio_input" label="%s">%s<label%s>%s</label></div>' % (choice_label, self.tag(), label_for, choice_label))

class ButtonRadioFieldRenderer(forms.widgets.RadioFieldRenderer):
    def __iter__(self):
        for i, choice in enumerate(self.choices):
            yield ButtonRadioInput(self.name, self.value,
                                   self.attrs.copy(), choice, i)

    def __getitem__(self, idx):
        choice = self.choices[idx] # Let the IndexError propogate
        return ButtonRadioInput(self.name, self.value,
                                self.attrs.copy(), choice, idx)

    def render(self):
        """Outputs a <ul> for this set of radio fields."""
        return mark_safe(u'<ul class="form-button-radio">\n%s\n</ul>' % u'\n'.join([u'<li>%s</li>'
                % w for w in self]))

class ButtonRadioSelect(forms.RadioSelect):
    renderer = ButtonRadioFieldRenderer

