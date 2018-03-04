
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="estimates for issue selections",
                content="when selecting multiple issues, in the spec and finance mien you can see the total estimate for those issues, taking velocity into account. this same information appears when selecting one or more sprints. (you need finance permission to see costs, but you can always see estimates)").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0108_release_notes_error_message_can_be_01Mar2018'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
