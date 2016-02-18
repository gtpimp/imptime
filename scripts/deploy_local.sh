#!/bin/bash

#force a sudo early
sudo ls > /dev/null

ROOT=`git rev-parse --show-toplevel`
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
sudo rm -f `find . -iname "*.pyc"`

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
sudo chown -R `whoami` logs
sudo chown nagios logs/nagios.log

cd ${ROOT}
if [ ! -d locks ]; then
    mkdir locks
fi
sudo chown -R `whoami` locks

cd ${ROOT}/logs
if [ ! -d cookies ]; then
    mkdir cookies
fi
sudo chown -R `whoami` cookies

cd ${ROOT}/logs
if [ ! -d pdfs ]; then
    mkdir pdfs
fi
sudo chown -R `whoami` pdfs


echo "updating database"
cd ${SITE_PATH}
python manage.py syncdb
if [ $? != 0 ]; then
    echo "syncdb failed: ABORTING"
    exit 1
fi
python manage.py migrate
if [ $? != 0 ]; then
    echo "db migrate failed: ABORTING"
    exit 1
fi

echo "collecting static files"
python manage.py collectstatic --noinput --verbosity=0
cd -

echo "Deploy local complete"
