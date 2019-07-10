#!/bin/bash

cd "`dirname \"$0\"`/"
COMPOSE_FOLDER=`pwd`
cd ${COMPOSE_FOLDER}/../
ROOT=`pwd`

echo "Stopping docker compose"
cd ${COMPOSE_FOLDER}
docker-compose -f docker-compose.yml -f docker-compose-prod.yml -f docker-compose-monitoring-client.yml down
