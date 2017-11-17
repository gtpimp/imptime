
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="breadcrumb links are saner",
                content="clicking on a project or sprint from the breadcrumbs goes to the list view instead of the dashboard. the dashboard buttons still do what you expect.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0039_merge_20171117_0938'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
