# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0010_userprofile_is_client_admin'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='userprofile',
            options={'ordering': ('user',), 'permissions': (('can_manage_client_users', 'Can manage client users'),)},
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='is_client_admin',
        ),
    ]
