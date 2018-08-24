
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="emacs importer old entries",
                content="bug fix, old entries with permission now works").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0239_release_notes_issue_filter_20Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
