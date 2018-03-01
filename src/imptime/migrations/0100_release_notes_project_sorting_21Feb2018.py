
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="project sorting",
                content="Projects are sorted by recent activity with extra columns to explain why. Also only show 20 projects at a time, with pagination").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0099_release_notes_auto_clocker_support_21Feb2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
