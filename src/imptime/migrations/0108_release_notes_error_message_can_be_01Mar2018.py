
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="error message can be closed",
                content="there is small cross in the top right of the yellow error message popup. i've noticed that often the error doesn't break the page and it's painful to refresh. note however that sometimes there is a fatal error and simply closing the error box isn't enough").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0107_release_notes_breadcrumb_menu_01Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
