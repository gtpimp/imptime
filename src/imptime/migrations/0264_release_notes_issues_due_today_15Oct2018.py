
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issues due today",
                content="issues have a due date. if that due date is today and assigned to you, and the issue is open, it will appear as a circled number next to your username in the top right. click to view those issues.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0263_release_notes_simplified_issue_cre_10Oct2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
