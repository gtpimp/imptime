# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('noui', '0007_nouicommandparameter_var_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='nouicommandparameter',
            name='search_function',
            field=models.TextField(max_length=255, blank=True),
        ),
    ]
