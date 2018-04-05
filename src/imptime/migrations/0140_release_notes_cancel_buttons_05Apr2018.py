
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="cancel buttons",
                content="added cancel buttons to comments, testable and description editors. ").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0139_release_notes_dont_show_zero_esti_05Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
