#!/bin/bash

BASE_DIR="`dirname \"$0\"`/.."
cd $BASE_DIR

if [ -z "${PEBBLE_PHONE}" ]; then
    echo "Please export the variable PEBBLE_PHONE to be the IP address of the Pebble phone app"
    exit 1
fi

cd ~/pebble/PebbleSDK-3.7
. ./venv/bin/activate
cd -
cd $BASE_DIR/imptimepebble

pebble install

