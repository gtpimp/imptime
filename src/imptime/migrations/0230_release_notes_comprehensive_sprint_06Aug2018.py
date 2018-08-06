
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="comprehensive sprint snapshot",
                content="the sprint snapshot includes a lot of information now, it is recommended before all budget discussions or recons").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0229_sprintsnapshot_estimate_time_summary'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
