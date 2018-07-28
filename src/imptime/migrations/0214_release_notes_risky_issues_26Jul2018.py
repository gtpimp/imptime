
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="risky issues",
                content="issues can be toggled as risky, implying something about them is uncertain but we're going to develop them anyway. this shows up on the sprint status summary too").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0213_release_notes_sprint_problem_indic_26Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
