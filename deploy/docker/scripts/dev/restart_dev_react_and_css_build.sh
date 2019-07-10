#!/bin/bash

echo "Sometimes the react+css build process hangs, use this script to restart it."

cd "`dirname \"$0\"`/"
COMPOSE_FOLDER=`pwd`
cd ${COMPOSE_FOLDER}/../
ROOT=`pwd`

cd ${COMPOSE_FOLDER}
docker-compose -f docker-compose.yml -f docker-compose-dev.transient-db.yml -f docker-compose-dev.yml stop dev-ui-react-and-css-builder
docker-compose -f docker-compose.yml -f docker-compose-dev.transient-db.yml -f docker-compose-dev.yml start dev-ui-react-and-css-builder
echo "About to tail logs, you can Ctrl-C this process without stopping the builder"
docker logs -f `docker ps | grep start-dev-ui | awk '{ print $1 }'`

