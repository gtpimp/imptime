#!/bin/bash

echo "This will also stop the postgresql image. If you want to keep postgres alive, use down.sh"
read -p "Press enter to continue " DUMMY

cd "`dirname \"$0\"`/"
COMPOSE_FOLDER=`pwd`
cd ${COMPOSE_FOLDER}/../
ROOT=`pwd`

echo "Stopping docker compose"
cd ${COMPOSE_FOLDER}
docker-compose -f docker-compose.yml -f docker-compose.transient-db.yml down

