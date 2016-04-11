# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0005_auto_20160203_0928'),
    ]

    operations = [
        migrations.AlterField(
            model_name='calendarevent',
            name='caldav_uid',
            field=models.CharField(db_index=True, max_length=100, null=True, blank=True),
        ),
    ]
