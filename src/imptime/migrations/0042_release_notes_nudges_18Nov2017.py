
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="nudges",
                content="the default landing page is now the nudge screen. this is intended to help you choose what yo work on. it's early days, if you don't like it, use the Projects link in the meun").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0041_auto_20171118_1448'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
