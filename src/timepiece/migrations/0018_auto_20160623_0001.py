# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0017_auto_20160622_1908'),
    ]

    operations = [
        migrations.AlterField(
            model_name='issue',
            name='order',
            field=models.FloatField(null=True, blank=True),
        ),
    ]
