
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint creation bug",
                content="fixed bug preventing new sprints from being created").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0296_release_notes_sprint_proposal_02Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
