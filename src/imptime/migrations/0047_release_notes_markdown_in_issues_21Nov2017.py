
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="markdown in issues",
                content="description and testables support markdown").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0046_release_notes_Promotion_of_testabl_21Nov2017'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
