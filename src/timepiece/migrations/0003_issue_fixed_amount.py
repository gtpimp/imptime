# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0002_auto_20151014_2232'),
    ]

    operations = [
        migrations.AddField(
            model_name='issue',
            name='fixed_amount',
            field=models.DecimalField(null=True, max_digits=8, decimal_places=2, blank=True),
        ),
    ]
