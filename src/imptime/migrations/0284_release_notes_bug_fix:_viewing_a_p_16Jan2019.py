
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="bug fix: viewing a page with a url whcn logged out now shows the login page correctly",
                content="").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0283_release_notes_bug_fix:_feature_lis_16Jan2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
