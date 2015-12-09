#!/bin/bash

BASE_DIR="`dirname \"$0\"`/.."
cd $BASE_DIR

cd ~/pebble/PebbleSDK-3.7
. ./venv/bin/activate
cd -
cd $BASE_DIR/imptimepebble

pebble install

