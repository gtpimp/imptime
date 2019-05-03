#!/bin/bash

set -e

echo "running collect static"

cd "`dirname \"$0\"`/"
COMPOSE_FOLDER=`pwd`
cd ${COMPOSE_FOLDER}/../
ROOT=`pwd`

cd ${COMPOSE_FOLDER}
docker-compose -f docker-compose.yml -f docker-compose-dev.transient-db.yml -f docker-compose-dev.yml start deploy-ui-static-assets
