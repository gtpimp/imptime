
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="bug fix for attachments",
                content="the attachments page had a page crash, resolved").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0162_release_notes_user_invite_fixes_10May2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
