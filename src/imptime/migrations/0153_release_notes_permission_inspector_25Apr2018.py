
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="permission inspector",
                content="in the project menu, select permission inspector for an interactive way to view and set permissions on the page. only available if you have the vierw permission permission").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0152_release_notes_work_summary_by_user_13Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
