
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="emacs helper only on dev section",
                content="if you're not on the dev mien, you won't see the emacs help section in the issue").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0111_release_notes_removed_toolbar_butt_04Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
