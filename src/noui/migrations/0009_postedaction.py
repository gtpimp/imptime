# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings
import lib.fields


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('noui', '0008_auto_20160108_1518'),
    ]

    operations = [
        migrations.CreateModel(
            name='PostedAction',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField()),
                ('modified', models.DateTimeField()),
                ('deleted', models.BooleanField(default=False)),
                ('target_device', models.CharField(max_length=255, null=True, blank=True)),
                ('human_readable_source_command', models.TextField(blank=True)),
                ('status', models.CharField(max_length=20, choices=[(b'waiting', b'Waiting'), (b'refused', b'Refused'), (b'failed', b'Failed'), (b'completed', b'Completed')])),
                ('action_type', models.CharField(max_length=20, choices=[(b'redirect', b'Redirect'), (b'run_search_result', b'Run search result')])),
                ('action_args', models.TextField(null=True, blank=True)),
                ('source_command', lib.fields.ProtectedForeignKey(related_name='noui_posted_actions', on_delete=django.db.models.deletion.PROTECT, blank=True, to='noui.NouiCommand')),
                ('source_user', lib.fields.ProtectedForeignKey(related_name='noui_posted_actions_as_source', on_delete=django.db.models.deletion.PROTECT, blank=True, to=settings.AUTH_USER_MODEL)),
                ('target_user', lib.fields.ProtectedForeignKey(related_name='noui_posted_actions_as_target', on_delete=django.db.models.deletion.PROTECT, blank=True, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'default_permissions': [],
                'abstract': False,
            },
        ),
    ]
