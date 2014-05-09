#!/bin/bash

function graph {
  USER=$1
  echo "graphing $USER..."
  #python manage.py email_graphs --username $USER --test 1
  python manage.py email_graphs --username $USER --settings "implicitdesign.management_settings"
}

cd /home/timesheet
. ./venv/bin/activate
cd src

graph alec
graph gtp
graph david
graph mitzie
graph etienne
graph keith
graph gassan
graph eustace

