
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="project archiving",
                content="projects can be archived, which means assigned issues and due issues in those projects are ignored").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0331_release_notes_my_issues_popup_27Apr2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
