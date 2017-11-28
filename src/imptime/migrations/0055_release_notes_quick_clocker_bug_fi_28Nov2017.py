
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="quick clocker bug fix",
                content="clocking into a new issue had an error (for tshepo)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0054_auto_20171126_1643'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
