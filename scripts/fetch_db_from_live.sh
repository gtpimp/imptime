#!/bin/bash

DATE=$1
if [ -z "${DATE}" ]; then
    DATE=`date +%Y%m%d`
fi

TIME=$2
if [ -z "${TIME}" ]; then
    TIME="0230"
fi

FILENAME="timesheet_${DATE}_${TIME}.pgdump"
ANONYMISED_FILENAME="timesheet_${DATE}_${TIME}_anonymised.pgdump"

LOCAL_BACKUP_PATH=/home/gtp/id/imptime/db_backups
DB_NAME="implicitdesign"

echo "Fetching backup for ${DATE}_${TIME}..."
scp gtp@live.implicitdesign.co.za:/home/timesheet/db_backups/${FILENAME} ${LOCAL_BACKUP_PATH}
echo "Downloaded to ${LOCAL_BACKUP_PATH}/${FILENAME}"

echo "Recreating db"

sudo su - postgres -c "dropdb ${DB_NAME}"
RES=$?
if [ ! ${RES} == 0 ]; then
    echo "Failed to drop existing database"
    echo "Check if you're running the django dev server"
    exit ${RES}
fi
sudo su - postgres -c "createdb ${DB_NAME}"

echo "Importing db"
sudo su - postgres -c "pg_restore -d ${DB_NAME} ${LOCAL_BACKUP_PATH}/${FILENAME}"

read -p "Sanitize? (y/n)" SANITIZE
if [ "${SANITIZE}" != 'n' ]; then
    echo "Sanitising db"
    cd ~/id/imptime/
    . ./venv/bin/activate
    cd src
    python manage.py shell < /home/gtp/id/imptime/scripts/anonymise_rates.py
fi

echo "Dumping db (use 'imp' for the password)"
sudo su - postgres -c "pg_dump -i -h localhost -p 5432 --no-privileges --no-owner -F c -b -v -U imp -f ~/${ANONYMISED_FILENAME} implicitdesign"
sudo mv /var/lib/postgresql/${ANONYMISED_FILENAME} ${LOCAL_BACKUP_PATH}
echo "Sanitised backup at ${LOCAL_BACKUP_PATH}/${ANONYMISED_FILENAME}"

echo "Done"
