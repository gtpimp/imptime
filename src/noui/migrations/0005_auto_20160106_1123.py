# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models

def add_permission(apps, schema_editor):
    ContentType = apps.get_model('contenttypes', 'ContentType')
    Permission = apps.get_model('auth', 'Permission')
    NouiCommand = apps.get_model('noui', 'NouiCommand')
    
    content_type = ContentType.objects.get_for_model(NouiCommand)
    Permission.objects.create(codename='command_list',
                              name='Command list',
                              content_type=content_type)
    Permission.objects.create(codename='command_edit',
                              name='Command edit',
                              content_type=content_type)
    

class Migration(migrations.Migration):

    dependencies = [
        ('noui', '0004_auto_20160104_1500'),
    ]

    operations = [
        migrations.RunPython(add_permission),
    ]
