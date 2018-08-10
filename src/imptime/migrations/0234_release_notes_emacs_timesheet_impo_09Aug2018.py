
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="emacs timesheet importer",
                content="there is a limit of 2 business days. time entries before this will be ignored. To make changes to these times it's necessary to ask the project manager to do it").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0233_release_notes__08Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
