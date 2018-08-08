
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="better clocking",
                content="the clocking widgets have been revamped and shoudl now represent a fairly comprehensive suite of functionality").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0231_release_notes_missing_toolbar_bug_08Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
