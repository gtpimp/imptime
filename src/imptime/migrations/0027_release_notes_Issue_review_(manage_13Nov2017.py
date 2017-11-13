
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="Issue review (management)",
                content="Issues has a review date, and sprint have a review cycle. This is the first step towards having ImpTime guess what you need to do next.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0026_release_notes_roadmap_v1_12Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
