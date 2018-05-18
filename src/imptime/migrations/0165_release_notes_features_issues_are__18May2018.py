
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="features issues are collapsed",
                content="feature issues start out collapsed in the issue list. this makes the sprint more readable first time").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0164_remove_visualspecdocument_lores'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
