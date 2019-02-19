
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Clock fix",
                content="Fixed issue where time would update incorrectly").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0292_release_notes_comment_opacity_13Feb2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
