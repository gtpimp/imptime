
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="feature tree first version",
                content="the feature breadcrumb has a menu option feature, don't try it unless you're brave.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0250_feature_number'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
