#!/bin/bash

echo "These installation commands are intended for ubuntu, they result it gitbook being installed"
sudo apt install npm
sudo npm install gitbook-cli -g
sudo ln -s /usr/bin/nodejs /usr/bin/node
gitbook init
