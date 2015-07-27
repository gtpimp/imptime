BASE_DIR="`dirname \"$0\"`/.."
cd $BASE_DIR

ROOT=$(pwd)
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
python manage.py send_queued_messages --settings=implicitdesign.management_settings

