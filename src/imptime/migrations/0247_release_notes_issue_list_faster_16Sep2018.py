
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue list faster",
                content="the issue list has been rewrittern to be faster. in case of problems, the old list is available from the breadcrumbs menu as 'slow issues'").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0246_release_notes_only_download_sprint_09Sep2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
