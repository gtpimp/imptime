# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import lib.fields


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='NouiCommand',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField()),
                ('modified', models.DateTimeField()),
                ('deleted', models.BooleanField(default=False)),
                ('name', models.CharField(db_index=True, max_length=255, blank=True)),
                ('pattern', models.CharField(max_length=255, blank=True)),
                ('description', models.TextField(null=True, blank=True)),
                ('command_function', models.TextField(blank=True)),
            ],
            options={
                'default_permissions': [],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='NouiCommandParameter',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField()),
                ('modified', models.DateTimeField()),
                ('deleted', models.BooleanField(default=False)),
                ('name', models.CharField(max_length=255, blank=True)),
                ('var_name', models.CharField(max_length=255, blank=True)),
                ('pattern', models.CharField(max_length=255, blank=True)),
                ('search_function', models.TextField(max_length=255, blank=True)),
                ('description', models.TextField(null=True, blank=True)),
                ('command', lib.fields.ProtectedForeignKey(related_name='parameters', on_delete=django.db.models.deletion.PROTECT, blank=True, to='noui.NouiCommand')),
            ],
            options={
                'default_permissions': [],
                'abstract': False,
            },
        ),
    ]
