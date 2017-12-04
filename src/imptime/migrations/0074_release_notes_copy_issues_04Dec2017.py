
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="copy issues",
                content="in the issue sidebar there is a copy button, which copies the issue to a new sprint. this is useful for adding issues to regression sprints.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0073_release_notes_regression_sprints_04Dec2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
