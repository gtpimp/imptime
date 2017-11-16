
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="username",
                content="showing the full person's name instead of just the username. (will support customisable visible names later)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0034_release_notes_feature_issues_16Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
