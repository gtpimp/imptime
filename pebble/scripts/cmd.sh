#!/bin/bash

BASE_DIR="`dirname \"$0\"`/.."
cd $BASE_DIR

CMD=$1
if [ -z "$CMD" ]; then
    read -p "Command : " CMD
fi

if [ -z "${PEBBLE_PHONE}" ]; then
    echo "Please export the variable PEBBLE_PHONE to be the IP address of the Pebble phone app"
    exit 1
fi
echo "Using Pebble IP address ${PEBBLE_PHONE}"

cd ~/pebble/PebbleSDK-3.7
. ./venv/bin/activate
cd -
cd $BASE_DIR/imptimepebble

pebble $CMD $2 $3 $4 $5 $6 $7

