# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Attachment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('file_attachment', models.FileField(null=True, upload_to=b'mail-queue/attachments', blank=True)),
                ('name', models.CharField(max_length=255, null=True, blank=True)),
            ],
            options={
                'verbose_name': 'Attachment',
                'verbose_name_plural': 'Attachments',
            },
        ),
        migrations.CreateModel(
            name='MailerMessage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('subject', models.CharField(max_length=250, verbose_name='Subject', blank=True)),
                ('to_address', models.TextField(verbose_name='To')),
                ('bcc_address', models.TextField(verbose_name='BCC', blank=True)),
                ('from_address', models.EmailField(max_length=250, verbose_name='From')),
                ('content', models.TextField(verbose_name='Content', blank=True)),
                ('html_content', models.TextField(verbose_name='HTML Content', blank=True)),
                ('app', models.CharField(max_length=250, verbose_name='App', blank=True)),
                ('sent', models.BooleanField(default=False, verbose_name='Sent', editable=False)),
                ('last_attempt', models.DateTimeField(verbose_name='Last attempt', null=True, editable=False, blank=True)),
                ('created', models.DateTimeField()),
            ],
            options={
                'verbose_name': 'Message',
                'verbose_name_plural': 'Messages',
            },
        ),
        migrations.AddField(
            model_name='attachment',
            name='email',
            field=models.ForeignKey(blank=True, to='mailqueue.MailerMessage', null=True),
        ),
    ]
