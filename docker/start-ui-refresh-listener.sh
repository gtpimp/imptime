#!/usr/bin/env bash

set -e

cd /opt/imptime/api
python manage.py wait_for_flag ui_db_migrate_complete

>&2 echo "starting ui-refresh-listener..."

python manage.py start_refresh_listener
