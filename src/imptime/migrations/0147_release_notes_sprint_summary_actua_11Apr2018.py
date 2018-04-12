
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint summary actuals can be exported to csv",
                content="on the sprint cost summary, or when multi-selecting two or more issues, there is a download button to export to csv").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0146_release_notes_actuals_by_issue_10Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
