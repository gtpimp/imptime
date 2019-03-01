
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="bug fix for breadcrumbs",
                content="breadcrumbs don't show the incorect issue anymore when switvching between projects").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0293_release_notes_Clock_fix_19Feb2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
