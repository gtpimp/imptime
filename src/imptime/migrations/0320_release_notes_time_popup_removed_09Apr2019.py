
from __future__ import unicode_literals

from django.db import migrations

def forwards(apps, schema_editor):
    ReleaseNote = apps.get_model('imptime', 'ReleaseNote')
    ReleaseNote(header="time popup removed",
                content="when hovering over the time column inside a sprint, the popup showing all times has been removed. it's redundant and confusing.").save()

class Migration(migrations.Migration):

    dependencies = [
        ('imptime', '0319_release_notes_the_return_of_scroll_08Apr2019'),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
