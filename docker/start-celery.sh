#!/usr/bin/env bash

echo "configuring celery..."

python3 manage.py wait_for_flag db_migrate_complete

python3 manage.py set_flag celery_ready

cd /opt/imptime/api
export C_FORCE_ROOT=1
python3 manage.py celery worker --settings=implicitdesign.management_settings &
python3 manage.py celery beat --settings=implicitdesign.management_settings

