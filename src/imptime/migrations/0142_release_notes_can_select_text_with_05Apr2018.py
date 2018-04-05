
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="can select text without editing",
                content="when selecting test in issue descriptions and other text elements, the element won't become editable. It only become editable with a non-moving click").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0141_release_notes_sprint_list_filter_o_05Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
