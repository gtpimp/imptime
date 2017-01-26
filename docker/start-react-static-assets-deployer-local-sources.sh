#!/bin/bash

ROOT=/opt/imptime
STATIC_ASSETS_PATH=${ROOT}/static-assets

# Build
# Copy source to new directory so that it uses its own NPM modules
mkdir -p /tmp/imptime/work
cp -R /opt/imptime/reimp /tmp/imptime/work
cp -R /opt/imptime/reimp/external_config /tmp/imptime/work/reimp/src/
cd /tmp/imptime/work/reimp
npm install
NODE_ENV=production npm run build

mkdir -p ${STATIC_ASSETS_PATH}
cp -R /tmp/imptime/work/reimp/build/* ${STATIC_ASSETS_PATH}/
