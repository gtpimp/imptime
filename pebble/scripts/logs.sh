#!/bin/bash

BASE_DIR="`dirname \"$0\"`/.."
cd $BASE_DIR

echo "Watching logs"
./scripts/cmd.sh logs


