
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="encrypted wikis added",
                content="wikis can optionally be encrypted using a key, similar to how emacs gtd works. this can be used for sensitive server information that can be shared without security fears").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0270_auto_20181019_1943'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
