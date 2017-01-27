#!/bin/bash

ROOT=/opt/imptime
STATIC_ASSETS_PATH=${ROOT}/static-assets

cd $ROOT/reimp
npm install -g
npm run start