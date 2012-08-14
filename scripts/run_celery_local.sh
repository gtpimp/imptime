#!/bin/bash

echo "Running celery and celery camera. Use for development only, in production this is run as a full-fledged background process"

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

echo "Running celery"
cd ${SITE_PATH}
python manage.py celeryd -E -l INFO -v 1 &

echo "Running celery cam"
python manage.py celerycam &

echo "Celery is now running in the background. To view status, go to "
echo "http://127.0.0.1:8000/admin/djcelery/taskstate/"




