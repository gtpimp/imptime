# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0006_auto_20160201_1248'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='impd_client',
            field=models.ForeignKey(related_name='profiles', to='timepiece.Client', null=True),
        ),
        migrations.AlterField(
            model_name='business',
            name='impd_client',
            field=models.ForeignKey(related_name='businesses', to='timepiece.Client', null=True),
        ),
    ]
