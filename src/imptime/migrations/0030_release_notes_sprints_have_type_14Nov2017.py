
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprints have type",
                content="sprints have a type, including sprinkle, inbox, spec, backlog and template. These can also be filtered on to prevent clutter.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0029_release_notes_Issue_reviews_14Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
