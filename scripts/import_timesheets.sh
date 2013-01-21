#!/bin/bash

function update_git {
  USER=$1
  echo "update_git on $USER..."
  cd /home/timesheets/input/$USER
  git reset --hard HEAD
  git pull origin master
}

function graph {
  USER=$1
  echo "graphing $USER..."
  python manage.py email_graphs --username $USER --test 1
}

update_git alec
update_git david
update_git gtp
update_git stephan

cd /home/timesheets/input/alec
git reset --hard HEAD

cd /home/website/impwebsite
. ./venv/bin/activate
cd src

echo "importing timesheet..."
python manage.py import_timesheet

graph alec
graph gtp
graph david
graph stephan
graph mitzie
graph ben





