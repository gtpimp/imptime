#!/bin/bash

function update_git {
  USER=$1
  echo "update_git on $USER..."
  cd /home/timesheet_input/$USER
  git reset --hard HEAD
  git pull origin master
}

update_git alec
update_git david
update_git gtp
update_git keith
update_git eustace
update_git etienne
update_git gassan

cd /home/timesheet
. ./venv/bin/activate
cd src

echo "importing timesheet..."
python manage.py import_timesheet --settings "implicitdesign.management_settings" 

