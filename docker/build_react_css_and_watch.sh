#!/bin/bash

ROOT=`pwd`

echo 'Starting ui-builder'
echo "working dir: $(pwd)"
npm install -g gulp webpack
npm install

echo 'starting webpack in background...'
webpack --progress --colors --watch --output-path=${ROOT}/../static_collected/js --output-filename=imptime.js &

echo 'starting gulp...'
gulp build watch

