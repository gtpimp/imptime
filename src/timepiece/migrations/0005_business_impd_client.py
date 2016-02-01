# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0004_issue_fixed_ctc_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='business',
            name='impd_client',
            field=models.ForeignKey(related_name='impd_clients', blank=True, to='timepiece.Client', null=True),
        ),
    ]
