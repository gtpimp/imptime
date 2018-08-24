
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="executive summary",
                content="added executive summary page to give a quick indication of what's hjappening with active sprints").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0242_release_notes_fullscreen_issue_bug_24Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
