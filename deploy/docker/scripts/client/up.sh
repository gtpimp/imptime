#!/bin/bash

cd "`dirname \"$0\"`/"
COMPOSE_FOLDER=`pwd`
cd ${COMPOSE_FOLDER}/../
ROOT=`pwd`

echo "Starting docker compose"
cd ${COMPOSE_FOLDER}

docker-compose -f docker-compose.yml -f docker-compose-prod.yml -f docker-compose.transient-db.yml up -d

echo "Started"
