
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Fixes error on Sprint Proposal",
                content="Sprint Proposals can now be downloaded if issues have only been estimated and not worked on").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0303_release_notes_fixes_add_user_to_pr_12Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
