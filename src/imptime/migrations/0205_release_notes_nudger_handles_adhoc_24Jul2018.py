
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="nudger handles adhoc issues for assignment",
                content="assigned issues only cause a nudge if they in a sprint or a checklist. other sprint types only nudge for adhoc issues").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0204_release_notes_issue_problems_colum_24Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
