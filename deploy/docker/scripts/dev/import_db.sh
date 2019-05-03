#!/bin/bash

cd "`dirname \"$0\"`/"

DB_FILENAME=$1
DB_NAME="imptime"
DB_USER="dev"

if [ -z "$DB_FILENAME" ]; then
    echo "Please pass in the db filename to import"
    exit 1
fi

if [ ! -f "${DB_FILENAME}" ]; then
    echo "db file to import doesn't exist at ${DB_FILENAME}"
    exit 1
fi

DOCKER_CMD="docker exec -it `docker ps | grep postgres | awk '{print $1}'` "

echo "Creating user, use 'dev' for the password"

$DOCKER_CMD createuser  --user=${DB_USER} -P -s -e ${DB_USER}
$DOCKER_CMD psql --host=localhost --port=5432 --user=${DB_USER} -d ${DB_NAME} -c "ALTER USER dev WITH SUPERUSER;"

set -e

# This command is useful for killing all open connections to the db.
#$DOCKER_CMD psql --host=localhost --port=5432 --user=${DB_USER} -d ${DB_NAME} -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${DB_NAME}';"

echo "Dropping old db"
$DOCKER_CMD psql --host=localhost --port=5432 --user="dev" -d postgres -c "drop database if exists ${DB_NAME}"
echo "Recreating old db"
$DOCKER_CMD createdb --host=localhost --port=5432 --user=${DB_USER} -O dev ${DB_NAME}

echo "Importing..."
cp ${DB_FILENAME} external_config/

#read -p "Use pg_restore (a) or psql (b) ?" CHOICE
CHOICE='a'

if [ $CHOICE == 'a' ]; then
    echo "Using pg_restore"
    $DOCKER_CMD pg_restore --host=localhost --port=5432 --user=${DB_USER} --no-owner -d ${DB_NAME} /opt/imptime/api/implicitdesign/external_config/$(basename ${DB_FILENAME})
else
    echo "Using psql"
    $DOCKER_CMD psql --host=localhost --port=5432 --user=${DB_USER} -d ${DB_NAME} -f /opt/imptime/api/implicitdesign/external_config/$(basename ${DB_FILENAME})
    
fi

echo "Import complete"
echo "You will need to take the docker stack down and up again for the migrations to run correctly"

