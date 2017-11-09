
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="shift clicking issues",
                content="if you shift click issues, previously selected issues stay selected like you would expect").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0019_release_notes_git_commit_message_p_08Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
