
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint sorting faster",
                content="fixed a bug which made sorting sprints very slow").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0056_release_notes_issues_by_email_28Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
