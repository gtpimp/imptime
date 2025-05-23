#!/usr/bin/env bash

echo "configuring celery..."

python manage.py wait_for_flag db_migrate_complete

python manage.py set_flag celery_ready

cd /opt/imptime/api
export C_FORCE_ROOT=1
python manage.py celery worker --settings=implicitdesign.management_settings &
python manage.py celery beat --settings=implicitdesign.management_settings

