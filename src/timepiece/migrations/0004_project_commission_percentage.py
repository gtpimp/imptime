# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0003_userprofile_required_daily_work_hours'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='commission_percentage',
            field=models.FloatField(default=10, verbose_name=b'Commission payable on the total billable amount'),
        ),
    ]
