
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="estimated dev time left",
                content="the sprint state summary shows the remaining number of dev hours left in the sprinut").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0215_release_notes_issuehistory_26Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
