
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issue creation for features",
                content="when a feature is selected, new issues will be added to that feature under certain conditions. see issue733").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0065_release_notes_render_issues_hyperl_29Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
