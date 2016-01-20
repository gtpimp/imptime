# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


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
                ('pattern', models.CharField(max_length=255, blank=True)),
                ('search_function', models.CharField(max_length=255, blank=True)),
                ('description', models.TextField(null=True, blank=True)),
            ],
        ),
    ]
