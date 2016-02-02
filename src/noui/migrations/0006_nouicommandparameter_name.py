# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('noui', '0005_auto_20160106_1123'),
    ]

    operations = [
        migrations.AddField(
            model_name='nouicommandparameter',
            name='name',
            field=models.CharField(max_length=255, blank=True),
        ),
    ]
