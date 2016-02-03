# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0004_project_commission_percentage'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='commission_percentage',
            field=models.FloatField(default=0, verbose_name=b'Commission payable on the total billable amount'),
        ),
    ]
