
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue features are expanded",
                content="by default all features are expanded. this makes the developer mode more logical to work through and avoids the problem of hidden issues").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0079_release_notes_issue_features_21Dec2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
