
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint reviews",
                content="sprints which have overdue reviews show in the problems page. inbox sprints don't automatically become nudges, this is based on the review cycle instead").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0206_release_notes_inbox_review_schedul_24Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
