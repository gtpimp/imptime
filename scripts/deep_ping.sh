#!/bin/bash

BASE_DIR="`dirname \"$0\"`/.."
cd $BASE_DIR

ROOT=`git rev-parse --show-toplevel`
cd ${ROOT}
SRC=${ROOT}/src
SITE_PATH=${SRC}
VENV=${ROOT}/venv

echo "activate virtualenv"
cd ${VENV}
. ./bin/activate
if [ $? != 0 ]; then
    echo "failed to activate virtualenv at ${VENV}: ABORTING"
    exit 1
fi
cd -

cd ${SITE_PATH}
python manage.py deep_ping --settings=implicitdesign.nagios_settings
RES=$?
exit ${RES}

