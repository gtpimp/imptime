# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import datetime
import django.db.models.deletion
import lib.fields


class Migration(migrations.Migration):

    dependencies = [
        ('noui', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='nouicommandparameter',
            options={'default_permissions': []},
        ),
        migrations.AddField(
            model_name='nouicommandparameter',
            name='command',
            field=lib.fields.ProtectedForeignKey(related_name='parameters', on_delete=django.db.models.deletion.PROTECT, default=None, blank=True, to='noui.NouiCommand'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='nouicommandparameter',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2016, 1, 4, 14, 21, 59, 989472)),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='nouicommandparameter',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='nouicommandparameter',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2016, 1, 4, 14, 22, 3, 517365)),
            preserve_default=False,
        ),
    ]
