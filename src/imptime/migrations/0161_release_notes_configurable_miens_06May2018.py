
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="configurable miens",
                content="the default miens (those little blue buttons at the tope of the screen) are gone. now you have to configure them. the default mien should be ok, but you'll be wanting to tweak things. this applies to elements in the issue sidebar too").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0160_mien_features'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
