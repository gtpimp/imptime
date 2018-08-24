
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="fullscreen issue bug fix",
                content="full screen mode on issues works").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0241_release_notes_page_title_shows_pro_24Aug2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
