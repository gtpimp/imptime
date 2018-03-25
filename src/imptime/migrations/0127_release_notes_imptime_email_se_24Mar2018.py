
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="imptime.com email server up",
                content="you can email myprojectname@imptime.com to create issues against any project (replease myprojectname with the name of the project) the old impbox@impd.co.za email still works for now, but it will be disabled in a week ro so)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0126_release_notes_wiki_autosave_22Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
