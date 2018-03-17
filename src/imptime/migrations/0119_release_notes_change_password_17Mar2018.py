
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="change password",
                content="fixed change password functionality").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0118_release_notes_project_statement_re_13Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
