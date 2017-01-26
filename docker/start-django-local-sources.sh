#!/bin/bash

#force a  early
 ls > /dev/null

ROOT=/opt/imptime
cd ${ROOT}
SRC=${ROOT}/src
SITE_PATH=${SRC}

echo "deleting python compiled files"
cd ${SRC}/implicitdesign
 rm -f `find . -iname "*.pyc"`

cd ${SITE_PATH}/implicitdesign/external_config
if [ ! -f "django_local_settings.py" ]; then
    echo "creating default django_local_settings.py"
    touch django_local_settings.py
fi
cd -

echo "fixing permissions"
cd ${ROOT}
if [ ! -d logs ]; then
    mkdir logs
fi
# chown -R `whoami` logs
# chgrp nagios logs/nagios.log
# chmod g+w logs/nagios.log

cd ${ROOT}
if [ ! -d locks ]; then
    mkdir locks
fi
chown -R `whoami` locks

cd ${ROOT}/logs
if [ ! -d cookies ]; then
    mkdir cookies
fi
 chown -R `whoami` cookies

cd ${ROOT}/logs
if [ ! -d pdfs ]; then
    mkdir pdfs
fi
 chown -R `whoami` pdfs

#echo "collecting static files"
cd ${ROOT}/src
#python manage.py collectstatic --noinput --verbosity=0
#python manage.py runserver 0.0.0.0:8000

cd ${ROOT}
pip install --upgrade pip # this should only be run in local version

pip install -r requirements.txt

#until [ -f /run/migrate.complete ]; do
#  >&2 echo "waiting for database migration..."
#  sleep 5
#done
cd ${ROOT}/src
python manage.py wait_for_flag db_migrate_complete

cd ${ROOT}/src
#gunicorn implicitdesign.wsgi -b 0.0.0.0:8000
daphne implicitdesign.asgi:channel_layer -b 0.0.0.0 -p 8000

echo "start django complete"
