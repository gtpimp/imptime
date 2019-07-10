#!/bin/bash

cd "`dirname \"$0\"`/"
COMPOSE_FOLDER=`pwd`
cd ${COMPOSE_FOLDER}/../
ROOT=`pwd`

echo "Starting docker compose"
cd ${COMPOSE_FOLDER}

echo "Setting memory (needed if elasticsearch is running locally)"
sudo sysctl -w vm.max_map_count=262144

echo "fixing permissions for elasticsearch (if running locally)"
sudo mkdir -p /opt/imptime/elasticsearch_data
sudo chmod -R 777 /opt/imptime/elasticsearch_data

docker-compose -f docker-compose-monitoring-server.yml -f docker-compose-elasticsearch.yml up -d

echo "Started"
