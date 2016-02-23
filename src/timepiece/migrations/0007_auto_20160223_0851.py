# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0006_auto_20160216_1057'),
    ]

    operations = [
        migrations.AlterField(
            model_name='calendarevent',
            name='status',
            field=models.CharField(default=b'ready', max_length=50, choices=[(b'ready', b'Ready'), (b'done', b'Done'), (b'cancelled', b'Cancelled'), (b'UNKNOWN', b'UNKNOWN')]),
        ),
    ]
