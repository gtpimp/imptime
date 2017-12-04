
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="regression sprints",
                content="similar to template and checklist sprints, there are now regression and audit sprints. they work the same way, and will be used to track regression tess").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0072_release_notes_issue_tags_03Dec2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
