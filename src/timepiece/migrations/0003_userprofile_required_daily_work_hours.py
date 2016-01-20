# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0002_auto_20151014_2232'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='required_daily_work_hours',
            field=models.IntegerField(default=8, blank=True),
        ),
    ]
