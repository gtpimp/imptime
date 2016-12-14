# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('timepiece', '0018_auto_20160623_0001'),
    ]

    operations = [
        migrations.AddField(
            model_name='business',
            name='point_person',
            field=models.ForeignKey(default=3, to=settings.AUTH_USER_MODEL),
        ),
    ]
