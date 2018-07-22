
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="nudge list longer",
                content="the nuife list contains all issues, not just sprints").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0195_release_notes_problem_page_22Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
