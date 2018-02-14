
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="autoclock",
                content="Auto clock is here. Hover over the clock icon in the header and clock away. Intended to replace emacs clocking and make it easier for managers to clock against a sprint instead of an issue").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0094_release_notes_fix_for_adding_issue_09Feb2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
