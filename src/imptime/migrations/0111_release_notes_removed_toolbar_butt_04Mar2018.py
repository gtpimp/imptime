
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="removed toolbar buttons",
                content="the popup menus on the breadcrumbs are at least as convenient as the buttons, and the buttons added noise to the page, so they're gone.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0110_release_notes_vat_saved_04Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
