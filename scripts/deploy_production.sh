#!/bin/bash

if [ `whoami` != 'gtp' ]; then
    echo "Please run as user 'gtp'"
    exit 1
fi

#force a sudo early
sudo ls > /dev/null

ROOT=/home/timesheet

echo "Updating from git"
cd ${ROOT}
git reset --hard HEAD
git pull origin master

echo "Running deploy_local"
cd ${ROOT}
./scripts/deploy_local.sh

echo "Collecting static"
. ./venv/bin/activate
cd ${ROOT}/src
python ./manage.py collectstatic --noinput --verbosity=0

echo "Updating permissions"
cd ${ROOT}
sudo chown -R iredadmin:gtp *
sudo chmod g+w -R *

echo "Reloading apache"
sudo /etc/init.d/apache2 reload

echo "Done"
