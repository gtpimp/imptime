
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="create issue by email bug (for the hundredth time)",
                content="yes yes, hopefully this is the second-last time it needs fixing, sorry").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0060_release_notes_issue_estimate_col_r_29Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
