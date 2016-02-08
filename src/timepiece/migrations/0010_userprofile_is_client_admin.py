# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0009_merge'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_client_admin',
            field=models.BooleanField(default=False),
        ),
    ]
