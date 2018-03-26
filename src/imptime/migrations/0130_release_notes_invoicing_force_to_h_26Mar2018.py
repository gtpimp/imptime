
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="invoicing force to have projects",
                content="all invoices must have a project now, it was optional before because there was only one client").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0129_release_notes_neatened_the_sidebar_25Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
