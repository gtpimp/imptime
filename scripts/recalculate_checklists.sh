#!/bin/bash

cd /home/timesheet
. ./venv/bin/activate
cd src

python manage.py recalculate_checklists --settings "implicitdesign.management_settings" 

