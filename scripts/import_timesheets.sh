#!/bin/bash

cd ~/impwebsite
. ./venv/bin/activate
cd src
python manage.py import_timesheet
