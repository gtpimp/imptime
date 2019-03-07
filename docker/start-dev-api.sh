#!/usr/bin/env bash

set -e

cd /opt/imptime/api/
python manage.py wait_for_flag db_migrate_complete

python manage.py collectstatic --noinput
python manage.py runserver 0.0.0.0:8002
