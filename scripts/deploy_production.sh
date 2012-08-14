#!/bin/bash

#force a sudo early
sudo ls > /dev/null

ROOT=`git rev-parse --show-toplevel`
cd ${ROOT}

echo "Updating from git"
git reset --hard HEAD
git pull origin master

echo "Reloading apache"
sudo /etc/init.d/apache2 reload

echo "Done"
