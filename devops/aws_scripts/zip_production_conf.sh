#!/usr/bin/env bash

cd "`dirname \"$0\"`/.."
BASE_DIR=$(pwd)
DIST_DIR=$BASE_DIR/secret/dist
ZIP=$DIST_DIR/external_config.zip

mkdir -p $DIST_DIR
rm $ZIP
cd $BASE_DIR/secret/
zip -r $ZIP external_config/*
