
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="companies added",
                content="companies have been added as a primary entity, with permissions. the company menu items have been moved to the breadcrumbs").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0274_release_notes_sprint_proposal_27Oct2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
