
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Testable during bulk creates",
                content="When bulk creating issues, testables are automatically created (see instructions on the bulk create page)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0198_release_notes_confirm_cancel_23Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
