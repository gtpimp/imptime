#!/bin/bash

set -e

docker exec -it `docker ps | grep backup | awk '{print $1}'` python /opt/imptime/backup.py
