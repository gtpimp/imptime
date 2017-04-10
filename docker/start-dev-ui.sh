#!/usr/bin/env bash

set -e

cd /opt/imptime/ui
python manage.py wait_for_flag ui_db_migrate_complete

python manage.py runserver 0.0.0.0:8004
