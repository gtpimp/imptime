
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="bug fix for missing data",
                content="occassionally open edit boxes would lose their changes. the causes seemed to be side effects of editing projects or sprints by another user, this is resolved.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0294_release_notes_bug_fix_for_breadcru_01Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
