
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="multiple issue actual summary bug fix",
                content="calculating the total for an issue with multiple users fixed on the new multiple issue summary page").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0148_release_notes_multiple_issue_summa_12Apr2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
