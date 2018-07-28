
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="import issue type, issue status and estimate",
                content="when importing issues using bulk import or emacs, it is possible to specify attributes to auto set the issue type, the issue status and the estimated hours. see the bulk import page for examples").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0209_release_notes_adhoc_issues_are_tem_24Jul2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
