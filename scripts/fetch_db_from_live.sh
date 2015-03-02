#!/bin/bash

FILENAME="timesheet_`date +%Y%m%d`_0230.pgdump"
ANONYMISED_FILENAME="timesheet_`date +%Y%m%d`_0230_anonymised.pgdump"

LOCAL_BACKUP_PATH=/home/gtp/id/imptime/db_backups
DB_NAME="implicitdesign"

echo "Fetching latest backup..."
scp gtp@live.implicitdesign.co.za:/home/timesheet/db_backups/${FILENAME} ${LOCAL_BACKUP_PATH}

echo "Recreating db"
sudo su - postgres -c "dropdb ${DB_NAME}"
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
sudo su - postgres -c "pg_dump -i -h localhost -p 5432 -F c -b -v -U imp -f ~/${ANONYMISED_FILENAME} implicitdesign"
sudo mv /var/lib/postgresql/${ANONYMISED_FILENAME} ${LOCAL_BACKUP_PATH}
echo "Sanitised backup at ${LOCAL_BACKUP_PATH}/${ANONYMISED_FILENAME}"

echo "Done"
