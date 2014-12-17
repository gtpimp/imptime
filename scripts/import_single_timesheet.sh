#!/bin/bash

SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd ${SCRIPT_DIR}
ROOT=`git rev-parse --show-toplevel`
cd ${ROOT}
SRC=${ROOT}/src
SITE_PATH=${SRC}
VENV=${ROOT}/venv

DEST_URL=$1
USERNAME=$2
FILENAME=$3
FILEPATH=$4

echo "activate virtualenv"
cd ${VENV}
. ./bin/activate
if [ $? != 0 ]; then
    echo "failed to activate virtualenv at ${VENV}: ABORTING"
    exit 1
fi
cd -

if [ -z "${DEST_URL}" ]; then
    echo "Give the imptime url (no trailing slash)  "
    echo " (leave blank to use production, imptime.impd.co.za)"
    echo " (use localhost:8002 or similar for development installation"
    read -p " : " DEST_URL
    if [ -z "${DEST_URL}" ]; then
        DEST_URL="imptime.impd.co.za"
    fi
fi
echo "Sending to ${DEST_URL}"

if [ -z "${USERNAME}" ]; then
    read -p "Enter your imptime username : " USERNAME
fi
echo "Username is ${USERNAME}"

if [ -z "$FILENAME" ]; then
    read -p "Enter the org filename : " FILENAME
fi
echo "Filename is ${FILENAME}"

if [ -z "$FILEPATH" ]; then
    read -p "Enter the gtd folder : " FILEPATH
fi
echo "Filepath is ${FILEPATH}"

cd ${SRC}
python manage.py import_single_timesheet $DEST_URL $USERNAME $FILENAME $FILEPATH
