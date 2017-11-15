
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Make feature issues successive",
                content="When selecting a feature issue, there is a button which will bring all the children issues immediately below the feature issue (ie successive to it)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0030_release_notes_sprints_have_type_14Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
