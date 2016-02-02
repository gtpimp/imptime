# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0004_issue_fixed_ctc_amount'),
    ]

    operations = [
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, blank=True)),
                ('code', models.CharField(max_length=100, blank=True)),
                ('email', models.EmailField(max_length=254)),
                ('logo', models.FileField(null=True, upload_to=b'logos', blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('modified_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.AddField(
            model_name='business',
            name='impd_client',
            field=models.ForeignKey(related_name='impd_clients', blank=True, to='timepiece.Client', null=True),
        ),
    ]
