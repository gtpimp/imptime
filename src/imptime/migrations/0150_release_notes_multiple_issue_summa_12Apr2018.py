
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="multiple issue summary exports issue list",
                content="when downloading the multiple issue summary, all issues are included. they are not shown on the frontend because it should be obvious what issues are selected").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0149_release_notes_multiple_issue_actua_12Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
