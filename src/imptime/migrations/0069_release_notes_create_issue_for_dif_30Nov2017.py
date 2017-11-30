
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="create issue for different sprint",
                content="the new issue form allow selecting a different sprint (the default is the current sprint)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0068_release_notes_issue_count_in_sprin_30Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
