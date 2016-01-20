# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('noui', '0003_nouicommand_command_function'),
    ]

    operations = [
        migrations.AlterField(
            model_name='nouicommand',
            name='command_function',
            field=models.TextField(blank=True),
        ),
    ]
