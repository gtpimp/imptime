
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="auto clocker supports admin",
                content="the auto-clocker has a default project called 'admin'. this is used for clocking time against the admin project, typicalsly for office managers").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0098_release_notes_autoclock_19Feb2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
