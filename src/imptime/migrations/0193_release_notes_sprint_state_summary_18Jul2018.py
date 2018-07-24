
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint state summary column",
                content="Added a new column which indicates problems with a sprint. So far indicates missing testables, assignees, estimates and budget").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0192_release_notes_issue_creation_by_em_13Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
