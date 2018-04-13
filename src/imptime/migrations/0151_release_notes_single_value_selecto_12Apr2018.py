
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="single value selector rememebers",
                content="popups like the issue state selector, or sprint selector, now rememeber the 2 most recent selections").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0150_release_notes_multiple_issue_summa_12Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
