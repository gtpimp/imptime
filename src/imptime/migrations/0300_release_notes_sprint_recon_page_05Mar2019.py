
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="sprint recon page",
                content="added a psrint recon page, to go with the new proposal page. it shows estimates and actuals together").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0299_release_notes_project_breadcrumb_b_05Mar2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
