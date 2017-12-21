
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue features",
                content="the feature continued message has been removed. issues now show in their actual order. this isn't ideal but it's a lot less confusing than how it was").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0078_release_notes_bug_fix_for_deleting_06Dec2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
