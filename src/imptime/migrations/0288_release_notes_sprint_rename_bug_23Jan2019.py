
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint rename bug",
                content="fixed bug preventing sprint renaming").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0287_release_notes_cost_summary_csv_exp_23Jan2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
