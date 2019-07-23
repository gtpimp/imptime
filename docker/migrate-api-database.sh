#!/usr/bin/env bash
set -e

python manage.py wait_for_db

>&2 echo "migrating api database..."

#yes "yes" | python manage.py migrate

>&2 echo "completed migrating api database."

python manage.py set_flag db_migrate_complete


