
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issuehistory",
                content="you can view an issue's history from the breadcrumb menu for that issue. this is a first version, but helps to visualise what information is potentially available").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0214_release_notes_risky_issues_26Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
