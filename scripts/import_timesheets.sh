#!/bin/bash

function update_git {
  USER=$1
  echo "update_git on $USER..."
  cd /home/timesheet_input/$USER
  git reset --hard HEAD
  git pull origin master
}

function graph {
  USER=$1
  echo "graphing $USER..."
  #python manage.py email_graphs --username $USER --test 1
  python manage.py email_graphs --username $USER --settings "implicitdesign.management_settings"
}

update_git alec
update_git david
update_git gtp
update_git stephan

cd /home/timesheet
. ./venv/bin/activate
cd src

echo "importing timesheet..."
python manage.py import_timesheet --settings "implicitdesign.management_settings" 

graph alec
graph gtp
graph david
graph stephan
graph mitzie
graph ben
graph etienne

