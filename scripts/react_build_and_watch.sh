#!/bin/bash

ROOT=`git rev-parse --show-toplevel`
cd ${ROOT}
ROOT=`pwd`

cd ${ROOT}/react_build/
webpack --progress --colors --watch --output-path=${ROOT}/src/imptime/static/js
