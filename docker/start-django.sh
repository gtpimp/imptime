#!/bin/bash

#force a  early
 ls > /dev/null

# install dependencies
echo "Dependencies for ubuntu, for reference:"
echo "---------------------------------------"
echo " apt install python-dev postgresql-server-dev-9.5 virtualenv"
echo " apt install libjpeg-dev libxml2-dev libxslt1-dev"
echo " apt install redis-server"
echo " apt install npm nodejs-legacy"

ROOT=/opt/imptime
cd ${ROOT}
SRC=${ROOT}/src
SITE_PATH=${SRC}
VENV=${ROOT}/venv

echo "checking for virtualenv"
if [ ! -d ${VENV} ]; then
    cd ${ROOT}
    virtualenv --no-site-packages venv
fi

echo "activate virtualenv"
cd ${VENV}
. ./bin/activate
if [ $? != 0 ]; then
    echo "failed to activate virtualenv at ${VENV}: ABORTING"
    exit 1
fi
cd -

# cd ${SRC}/phantompdf
# if [ ! -d "phantomjs" ]; then
#     echo "installing phantomjs"
#     mkdir "phantomjs"
#     git clone git://github.com/ariya/phantomjs.git phantomjs
#     cd phantomjs
#     git checkout 1.9

#     # Add image support with a patch
#     git config --add remote.origin.fetch "+refs/pull/*/head:refs/remotes/origin/pr/*"
#     git fetch
#     git checkout pr/359
#     git checkout master
#     git merge pr/359

#     ./build.sh
# fi

echo "deleting python compiled files"
cd ${SRC}/implicitdesign
 rm -f `find . -iname "*.pyc"`

echo "installing requirements"
cd ${ROOT}
pip install -r requirements.txt
if [ $? != 0 ]; then
    echo "pip install failed: ABORTING"
    exit 1
fi
cd -

cd ${SITE_PATH}
if [ ! -f "local_settings.py" ]; then
    echo "creating default local_settings.py"
    touch local_settings.py
else
    echo "PIL dependancies ok"
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

cd ${ROOT}/src
python manage.py migrate
if [ $? != 0 ]; then
    echo "db migrate failed: ABORTING"
    exit 1
fi

echo "collecting static files"
cd ${ROOT}/src
python manage.py collectstatic --noinput --verbosity=0
python manage.py runserver 0.0.0.0:8000

echo "start django complete"
