# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('noui', '0006_nouicommandparameter_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='nouicommandparameter',
            name='var_name',
            field=models.CharField(max_length=255, blank=True),
        ),
    ]
