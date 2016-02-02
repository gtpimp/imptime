# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('noui', '0002_auto_20160104_1422'),
    ]

    operations = [
        migrations.AddField(
            model_name='nouicommand',
            name='command_function',
            field=models.CharField(max_length=255, blank=True),
        ),
    ]
