#!/bin/bash

ROOT=/opt/imptime
STATIC_ASSETS_PATH=${ROOT}/static-assets

mkdir -p ${STATIC_ASSETS_PATH}
cp -R /tmp/imptime/work/build/* ${STATIC_ASSETS_PATH}/
