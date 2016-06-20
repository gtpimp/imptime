#!/bin/bash

cd "`dirname \"$0\"`/.."
ROOT=`pwd`

cd ${ROOT}/react_build/
webpack --progress --colors --watch --output-path=${ROOT}/src/imptime/static/js
