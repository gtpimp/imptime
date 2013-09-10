#!/bin/bash


cd /home/timesheet
. ./venv/bin/activate
cd src
python manage.py import_from_redmine --settings "implicitdesign.management_settings"
python manage.py fix_issue_entry_relationship --settings "implicitdesign.management_settings"

