#!/usr/bin/env bash

set -e

cd /opt/imptime/api
python3 manage.py wait_for_flag db_migrate_complete

>&2 echo "starting ui-refresh-listener..."

python3 manage.py start_refresh_listener
