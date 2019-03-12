
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="fix due issues popup",
                content="fixes the link to display a popup of all issues that are due when selecting the due issues icon").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0306_release_notes_add_problems_card_11Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
