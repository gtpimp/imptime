
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="site url moved to app.imptime.com in preparation for having a static site on www.imptime.com",
                content="").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0184_release_notes_calendar_02Jun2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
