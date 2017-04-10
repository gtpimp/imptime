#!/usr/bin/env bash
set -e

python manage.py wait_for_db

>&2 echo "migrating ui database..."

yes "yes" | python manage.py migrate

>&2 echo "completed migrating ui database."

cd /opt/imptime/ui
python manage.py set_flag ui_db_migrate_complete
