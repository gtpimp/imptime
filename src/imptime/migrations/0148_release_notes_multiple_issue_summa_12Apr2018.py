
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="multiple issue summary bug fixes",
                content="fixed export to csv when using auto-clock").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0147_release_notes_sprint_summary_actua_11Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
