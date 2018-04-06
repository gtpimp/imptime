
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="default project",
                content="every user gets a default project, with a single sprint and a single issue. this is to make the onboarding for new users more friendly").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0142_release_notes_can_select_text_with_05Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
