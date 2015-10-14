# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('timepiece', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Jira',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('host', models.CharField(max_length=255)),
                ('board_id', models.CharField(help_text=b'this is the rapidView id in the jira url', max_length=20)),
                ('custom_field_name_for_issue_order', models.CharField(default=b'customfield_10006', help_text=b'the name of the field used to hold the issue sorting value ', max_length=20)),
                ('sync_actual_times', models.BooleanField(default=False)),
                ('sync_issue_ordering_to_jira', models.BooleanField(default=False)),
                ('sync_issue_ordering_from_jira', models.BooleanField(default=True)),
                ('business', models.ForeignKey(related_name='jira', to='timepiece.Business')),
            ],
        ),
        migrations.CreateModel(
            name='JiraSyncStatus',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('updated_at', models.DateTimeField(null=True, blank=True)),
                ('jira', models.ForeignKey(to='jira_interface.Jira')),
            ],
        ),
        migrations.CreateModel(
            name='JiraUser',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('jira_username', models.CharField(max_length=255)),
                ('jira_password', models.CharField(max_length=255)),
                ('jira', models.ForeignKey(to='jira_interface.Jira')),
                ('timepiece_user', models.ForeignKey(related_name='jira_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
