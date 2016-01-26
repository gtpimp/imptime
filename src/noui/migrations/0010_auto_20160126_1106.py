# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('noui', '0009_postedaction'),
    ]

    operations = [
        migrations.AlterField(
            model_name='postedaction',
            name='action_type',
            field=models.CharField(max_length=20, choices=[(b'redirect', b'Redirect'), (b'javascript', b'Javascript'), (b'run_search_result', b'Run search result')]),
        ),
        migrations.AlterField(
            model_name='postedaction',
            name='status',
            field=models.CharField(db_index=True, max_length=20, choices=[(b'waiting', b'Waiting'), (b'refused', b'Refused'), (b'failed', b'Failed'), (b'completed', b'Completed')]),
        ),
    ]
