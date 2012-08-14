#!/bin/bash

#force a sudo early
sudo ls > /dev/null

ROOT=/home/website/impwebsite
cd ${ROOT}

echo "Updating from git"
git reset --hard HEAD
git pull origin master

echo "Updating permissions"
sudo chown -R www-data:impwebsite *
sudo chmod g+w -R *

echo "Reloading apache"
sudo /etc/init.d/apache2 reload

echo "Done"
