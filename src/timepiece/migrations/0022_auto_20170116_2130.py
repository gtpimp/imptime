# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0021_auto_20170111_1049'),
    ]

    operations = [
        migrations.AlterField(
            model_name='business',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2017, 1, 16, 21, 30, 51, 747759), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='business',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2017, 1, 16, 21, 30, 56, 724296), auto_now=True),
            preserve_default=False,
        ),
    ]
