#!/usr/bin/env bash

SECRET_DIR=$1
# cd "`dirname \"$0\"`/.."
# SECRET_DIR=$(pwd)
DIST_DIR=$SECRET_DIR/dist
ZIP=$DIST_DIR/external_config.zip

mkdir -p $DIST_DIR
rm $ZIP
cd $SECRET_DIR/
zip -r $ZIP external_config/*
