#!/bin/bash

set -e

ROOT=/opt/imptime

cd ${ROOT}
pip install --upgrade pip # this should only be run in local version

pip install -r requirements.txt

cd ${ROOT}/src

python manage.py wait_for_db

echo "migrating..."

# TODO backup database

yes "yes" | python manage.py migrate
#python manage.py migrate
if [ $? != 0 ]; then
    echo "db migrate failed: ABORTING"
    exit 1
fi

python manage.py set_flag db_migrate_complete
#touch /run/migrate.complete
echo "migrate complete"
