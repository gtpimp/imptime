
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="uncertainty bug fix",
                content="project uncertainty/scope creep edit working").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0324_merge_20190411_2028'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
