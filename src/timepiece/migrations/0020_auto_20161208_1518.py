# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


def forwards(apps, schema_editor):
    projects = apps.get_model('timepiece', 'Project')
    
    business = apps.get_model('timepiece', 'Business').objects.all()       
    for b in business:
        business_projects = projects.objects.all().filter(business_id = b.id).order_by('-id')
        last_project = business_projects[0] #Latest Project
        b.point_person = last_project.point_person
        b.save()

class Migration(migrations.Migration):
   operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
       ]

   dependencies = [
        ('timepiece', '0019_business_point_person'),
    ]

