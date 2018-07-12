
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="calendar",
                content="first draft of calenduar and schedule functionality. there is a floating calendar, a calendar with a sidebar, and a scheduling calendar page. ").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0183_release_notes_company_problem_page_01Jun2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
