
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="my issues popup",
                content="first version of showing issues assigned to me").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0330_release_notes_Fixed_issue_scrolls_18Apr2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
