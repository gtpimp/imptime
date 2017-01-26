#!/bin/bash

ROOT="`dirname \"$0\"`/.."

function help {
  echo -e "${REV}Basic usage:\\n"
  echo -e " ${NORM} ${BOLD}$SCRIPT [ -d ] [ -l ]"
  echo "   ${REV}-d${NORM}  --Run in development mode"
  echo "   ${REV}-l${NORM}  --Run from local sources"
  exit 1
}

# TODO
# support for cleaning up orphans
# support for running background

while getopts "dl" OPT; do
    case $OPT in
        d) DEVELOPMENT_MODE=1 ;;
        l) FROM_LOCAL_SOURCES=1 ;;
        \?) help ;;
    esac
done

if [ "$FROM_LOCAL_SOURCES" ] && [ "$DEVELOPMENT_MODE" ]; then
    echo "incompatible options: development mode is not compatible with local sources"
    exit 1
fi

if [ "$DEVELOPMENT_MODE" ]; then
    echo "running in development mode"
    docker-compose -f $ROOT/docker/docker-compose.yml -f $ROOT/docker/docker-compose.local-sources.yml -f $ROOT/docker/docker-compose.provide-database.yml down
     docker-compose -f $ROOT/docker/docker-compose.yml -f $ROOT/docker/docker-compose.local-sources.yml -f $ROOT/docker/docker-compose.provide-database.yml up
fi

if [ "$FROM_LOCAL_SOURCES" ]; then
    echo "running from local sources"
    docker-compose -f $ROOT/docker/docker-compose.yml -f $ROOT/docker/docker-compose.local-sources.yml -f $ROOT/docker/docker-compose.provide-database.yml down
    docker-compose -f $ROOT/docker/docker-compose.yml -f $ROOT/docker/docker-compose.local-sources.yml -f $ROOT/docker/docker-compose.provide-database.yml up --build
fi

if [ -z "$FROM_LOCAL_SOURCES" ] && [ -z "$DEVELOPMENT_MODE" ]; then
    echo "running from images"
    docker-compose -f $ROOT/docker/docker-compose.yml down
    docker-compose -f $ROOT/docker/docker-compose.yml up
fi


#help
#echo "Bringing up Imptime using prebuilt Docker images"
#docker-compose up -f docker-compose.yml