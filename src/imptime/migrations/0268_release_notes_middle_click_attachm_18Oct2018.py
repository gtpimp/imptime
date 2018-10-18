
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="middle click attachments",
                content="middle clicking attachments opens them in a new tab").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0267_release_notes_decision_journal_18Oct2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
