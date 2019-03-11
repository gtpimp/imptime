
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="add issues by status card",
                content="add a sprint card that displays the number of issues by issue status (new, dev done, etc)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0303_release_notes_add_budget_card_11Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
