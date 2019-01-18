
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="bug fix for search results not showing",
                content="").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0284_release_notes_bug_fix:_viewing_a_p_16Jan2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
