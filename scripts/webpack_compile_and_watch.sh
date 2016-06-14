#!/bin/bash

cd "`dirname \"$0\"`/.."
ROOT=`pwd`
cd ${ROOT}

echo "Starting webpack in watch mode"
cd ${ROOT}/react_build/

webpack --progress --colors --watch --output-path=${ROOT}/src/static_collected/js
