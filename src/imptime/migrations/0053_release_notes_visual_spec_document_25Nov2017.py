
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="visual spec document",
                content="revamped the visual spec document editor, give it another go if you dare").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0052_auto_20171125_2243'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
