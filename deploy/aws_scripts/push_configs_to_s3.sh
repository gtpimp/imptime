#!/usr/bin/env bash

cd "`dirname \"$0\"`/../"

#ls -alr
mkdir -p build
cd config/stable/external_config && zip -r ../../../build/Stable.zip *
cd ../../../config/unstable/external_config && zip -r ../../../build/Unstable.zip *
cd ../../../

aws s3 cp --region eu-west-1 build/Stable.zip s3://imptime-environments
aws s3 cp --region eu-west-1 build/Unstable.zip s3://imptime-environments
