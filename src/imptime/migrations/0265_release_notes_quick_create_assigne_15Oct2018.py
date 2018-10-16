
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="quick create assigned issues",
                content="using + issue button in the nav bar allows selecting an assigned user and a checkbox to assign to today. this is a quick way to add tasks to people, because it will show up in their profile alert circle").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0264_release_notes_issues_due_today_15Oct2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
