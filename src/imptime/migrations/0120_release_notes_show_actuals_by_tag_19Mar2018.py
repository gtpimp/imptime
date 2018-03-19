
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="show actuals by tag",
                content="when multi-selecting issues (or selecting a sprint), the actuals for those issues are broken down by tag category").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0119_release_notes_change_password_17Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
