
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint proposal",
                content="the sprint proposal link in sprints produces a printable proposal, as well as a downloadable csv version").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0295_release_notes_bug_fix_for_missing__01Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
