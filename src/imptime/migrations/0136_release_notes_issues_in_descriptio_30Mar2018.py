
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="issues in descriptions",
                content="you can add issues to descriptions, wikie, comments and testables using the format: blahblah issue123 blahblah. these issues become enriched objects with status etc").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0135_wikipage_enriched_content'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
