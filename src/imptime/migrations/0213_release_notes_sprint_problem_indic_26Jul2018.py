
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint problem indicators improved",
                content="the sprint problem indicators use tooltips to display better. also in the issue list, issues missing testables or estimates are indicated").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0212_release_notes_sprint_warnings_on_s_25Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
