# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from timepiece import models

def forwards_func(apps, schema_editor):
    Client = apps.get_model('timepiece.Client')
    Business = apps.get_model('timepiece.Business')
    
    impd_client = Client.objects.create(name='Implicit Design', code='impd', email='gtp@impd.co.za')
    Business.objects.filter(impd_client__isnull=True).update(impd_client=impd_client)

def reverse_func(apps, schema_editor):
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('timepiece', '0005_business_impd_client'),
    ]

    operations = [
        migrations.RunPython(forwards_func, reverse_func),
    ]

