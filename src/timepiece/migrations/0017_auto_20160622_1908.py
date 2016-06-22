# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0016_auto_20160503_1243'),
    ]

    operations = [
        migrations.AlterField(
            model_name='issue',
            name='status',
            field=models.CharField(max_length=255, choices=[(b'new', b'new'), (b'devdone', b'dev_done'), (b'in_internal_qa', b'internal qa'), (b'internal_qa_passed', b'internal qa passed'), (b'in_client_qa', b'external qa'), (b'client_qa_passed', b'external qa passed'), (b'reopened', b'reopened'), (b'onhold', b'on hold'), (b'bug', b'bug'), (b'to be estimated', b'to be estimated'), (b'needscodereview', b'needs code review'), (b'cannot reproduce', b'cannot reproduce'), (b'discuss with client', b'discuss with client'), (b'dev unclear', b'dev unclear'), (b'duplicate', b'duplicate'), (b'to be designed', b'to be designed'), (b'imported', b'imported'), (b'management', b'management'), (b'quick_clocker', b'quick clocker')]),
        ),
        migrations.AlterField(
            model_name='project',
            name='order',
            field=models.FloatField(null=True, blank=True),
        ),
    ]
