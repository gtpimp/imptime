
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="bug fixes in issue dragging",
                content="dragging issues and collapsed features is working better now.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0031_release_notes_Make_feature_issues__15Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
