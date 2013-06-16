#!/bin/bash


cd /home/timesheet
. ./venv/bin/activate
cd src
python manage.py import_from_redmine --settings "implicitdesign.management_settings"

