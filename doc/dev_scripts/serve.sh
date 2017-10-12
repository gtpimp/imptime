#!/bin/bash

cd "`dirname \"$0\"`/../"
ROOT=`pwd`

gitbook serve ./doc

