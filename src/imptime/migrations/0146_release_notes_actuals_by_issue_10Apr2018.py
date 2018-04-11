
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="actuals by issue",
                content="the sprint statement page, and also the sprint sidebar, now include a breakdown of actuals by issue. this is not complete yet but is functional").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0145_release_notes_super_user_permissio_09Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
