
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Issue reviews",
                content="Issues can have reviewers, and they keep track of when each issue has been reviewed (for management)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0028_release_notes_popup_selectors_are__13Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
