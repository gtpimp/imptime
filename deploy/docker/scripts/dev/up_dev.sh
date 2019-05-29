#!/bin/bash

set -e

API_SETTINGS_SRC="../../config/sample/external_config/api_local_settings.py"
API_SETTINGS_DST="../../src/implicitdesign/external_config/api_local_settings.py"
API_SETTINGS_DST_DIR="../../src/implicitdesign/external_config/"

UI_SETTINGS_SRC="../../config/sample/external_config/react_local_settings.js"
UI_SETTINGS_DST="../../../reimp/public/local_settings/index.html"
UI_SETTINGS_DST_DIR="../../../reimp/public/local_settings/"

echo "This script only exists for testing. The database is transient and everything will be lost"

cd "`dirname \"$0\"`/"
COMPOSE_FOLDER=`pwd`
cd ${COMPOSE_FOLDER}/../
ROOT=`pwd`

if [ ! -e "${ROOT}/imptime-media" ]; then
    echo "You need to have a mounted folder for permanent storage at: "
    echo " ${ROOT}/imptime-media"
    echo "Auto creating"
    cd ${COMPOSE_FOLDER}
    mkdir -p imptime-media
fi

echo "Starting docker compose for transient database"
cd ${COMPOSE_FOLDER}
docker-compose -f docker-compose.yml -f docker-compose-dev.transient-db.yml -f docker-compose-dev.yml up -d

if [ ! -e ${API_SETTINGS_DST} ]; then
    echo "API settings not found"
    if [! -d ${API_SETTINGS_DST_DIR}]; then
        mkdir -p ${API_SETTINGS_DST_DIR}
        touch ${API_SETTINGS_DST_DIR}/__init__.py
    fi
    cp ${API_SETTINGS_SRC} ${API_SETTINGS_DST}
else
    echo "API settings found"
fi

if [ ! -e ${UI_SETTINGS_DST} ]; then
    echo "UI settings not found"
    if [ ! -d ${UI_SETTINGS_DST_DIR} ]; then
        mkdir -p ${UI_SETTINGS_DST_DIR}
    fi
    cp ${UI_SETTINGS_SRC} ${UI_SETTINGS_DST}
else
    echo "UI settings found"
fi


cat << EOF

The following endpoints are available:

http://localhost:3000   - react front-end,  auto-built version from your local reimp folder
                        - uses the container imptime/dev-ui-react-and-css-builder
                        - configured using your local version of imptime/reimp/public/local_settings/
                        - you can restart or tail it using 
                            ${COMPOSE_FOLDER}/restart_dev_react_and_css_build.sh

http://localhost:8002   - the api running your code, but you can't pdb.set_trace
                        - uses the container imptime/api
                        - configured using your local version of imptime/src/implicitdesign/external_config/api_local_settings.py
                          which you can copy from imptime/deploy/deployer_temp/dev_on/external_config/api_local_settings.py

http://localhost:8009   - this is an open port on the imptime/api container
                        - if you want to dev and test your local code then do this:
                            $ docker exec -it `docker ps | grep 8009 | awk '{ print $1 }'` bash
                            # python manage.py runserver 0.0.0.0:8009
                        - it's configured using your local version of 
                            imptime/src/implicitdesign/external_config/api_local_settings.py file
                        - hint: you'll probably also need to update
                          your react local_settings file to point here
                          for it to be useful

http://localhost:8025   - this is the MailHog mail catcher, you need to configure
                          the email backend in api_local_settings.py. 

                          The following settings should work:

                                 EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
                                 EMAIL_PORT = 1025
                                 EMAIL_HOST = 'mailhog'
                                 EMAIL_USE_TLS = False



database                - To get going the first time, you'll need to import a database into the postgres image.
                          You can use the helper script in this folder import_db.sh

db migrations           - You should create and run migrations from inside the api docker, use the same
                          shell as for the 8009 notes above


EOF

echo "Started"
