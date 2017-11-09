
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="creating bulk issues and email issues and timesheet issues",
                content="fixed bug when creating issues from timesheets and emails").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0021_release_notes_better_dragging_of_i_09Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
