#!/bin/bash

echo "This script only exists for testing. The database is transient and everything will be lost"
read -p "Press enter to continue " DUMMY

cd "`dirname \"$0\"`/"
COMPOSE_FOLDER=`pwd`
cd ${COMPOSE_FOLDER}/../
ROOT=`pwd`

if [ ! -e "${ROOT}/imptime-media" ]; then
    echo "You need to have a mounted folder for permanent storage at: "
    echo " ${ROOT}/imptime-media"
    echo "Auto creating"
    cd ${COMPOSE_FOLDER}
    mkdir -p imptime-media
fi

echo "Starting docker compose for transient database"
cd ${COMPOSE_FOLDER}

docker-compose -f docker-compose.yml -f docker-compose.transient-db.yml -f docker-compose-test.yml up -d

echo "Started"
