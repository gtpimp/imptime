#!/bin/bash

cd "`dirname \"$0\"`/../"
ROOT=`pwd`

gitbook build ./doc --log=debug --debug
