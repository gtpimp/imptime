
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="scrolling fixes",
                content="all pages have been refactored with a fixed scrolling mechanism").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0176_auto_20180524_2024'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
