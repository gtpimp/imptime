
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="popup selectors are case insensitive",
                content="useful for moving issues to new sprints, works on all popup selectors now").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0027_release_notes_Issue_review_(manage_13Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
