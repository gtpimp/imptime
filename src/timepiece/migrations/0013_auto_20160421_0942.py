# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('timepiece', '0012_merge'),
    ]

    operations = [
        migrations.AlterField(
            model_name='assignmentallocation',
            name='hours',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='contractassignment',
            name='num_hours',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='contractmilestone',
            name='hours',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='entry',
            name='hours',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='expense',
            name='amount',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=0),
        ),
        migrations.AlterField(
            model_name='income',
            name='amount',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=0),
        ),
        migrations.AlterField(
            model_name='issue',
            name='fixed_amount',
            field=models.DecimalField(null=True, max_digits=12, decimal_places=2, blank=True),
        ),
        migrations.AlterField(
            model_name='issue',
            name='fixed_ctc_amount',
            field=models.DecimalField(null=True, max_digits=12, decimal_places=2, blank=True),
        ),
        migrations.AlterField(
            model_name='personschedule',
            name='hours_per_week',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='project',
            name='budget',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='projectcontract',
            name='num_hours',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='projecthours',
            name='hours',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='rate',
            name='amount',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='rate',
            name='billable_amount',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='salary',
            name='amount',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='salary',
            name='bonus',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='salary',
            name='expenses',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='salary',
            name='leave_accrued',
            field=models.DecimalField(default=0, verbose_name=b'Leave accrued this month', max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='salary',
            name='leave_taken',
            field=models.DecimalField(default=0, verbose_name=b'Leave taken this month', max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='salary',
            name='paye',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='salary',
            name='sick_days',
            field=models.DecimalField(default=0, verbose_name=b'Sick days taken this month', max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='salary',
            name='uif',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='amount',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='billable_amount',
            field=models.DecimalField(default=0, max_digits=12, decimal_places=2),
        ),
    ]
