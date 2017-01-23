#!/bin/bash

ROOT=/opt/imptime

cd ${ROOT}/react_build/
export NODE_ENV=development
npm install -g gulp webpack
npm install
webpack --progress --colors --watch --output-path=${ROOT}/src/imptime/static/js

echo "start-react-dev complete"
