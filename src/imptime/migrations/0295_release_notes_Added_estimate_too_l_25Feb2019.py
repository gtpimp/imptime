
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Added estimate too large warning",
                content="Estimate warning logic moved to backend and will now show on estimates larger than 4 hours").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0294_release_notes_Added_warning_for_ex_15Feb2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
