# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0015_auto_20160503_1233'),
    ]

    operations = [
        migrations.AlterField(
            model_name='calendarevent',
            name='status',
            field=models.CharField(default=b'ready', max_length=50),
        ),
    ]
