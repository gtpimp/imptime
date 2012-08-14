#!/bin/bash

#force a sudo early
sudo ls > /dev/null

ROOT=~/impwebsite
cd ${ROOT}

echo "Updating from git"
#git reset --hard HEAD
git pull origin master

echo "Running deploy_local"
./scripts/deploy_local.sh

echo "Updating permissions"
sudo chown -R www-data:impwebsite *
sudo chmod g+w -R *

echo "Reloading apache"
sudo /etc/init.d/apache2 reload

echo "Done"
