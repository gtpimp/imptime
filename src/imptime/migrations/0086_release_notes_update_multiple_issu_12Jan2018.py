
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="update multiple issues bug fix",
                content="when selecting multiple issues and changing their assigned user or status as a group, the change only affected one issue. bug was instroduced a week ago, fixed.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0085_release_notes_fixed_email_attachme_11Jan2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
