#!/usr/bin/env bash

cd "`dirname \"$0\"`/.."
BASE_DIR=$(pwd)

# This is used to keep the stack numbers unique, enter a sequence number
STACK_NUMBER=$1
if [ -z ${STACK_NUMBER} ]; then
    echo "You must give a unique stack number as first parameter"
    exit 1
fi

PROD_ZIP_FILENAME=$2
if [ -z ${PROD_ZIP_FILENAME} ]; then
    PROD_ZIP_FILENAME="imptime_prod_`date +%d%B%Y_%H%M%S`.zip"
    echo "Auto setting zip file to: ${PROD_ZIP_FILENAME}"
    echo "To change this, pass as the second parameter"
fi

AWS_PROFILE_NAME=imptime_rhoberman
AWS_REGION=eu-west-2
IAM_INSTANCE_PROFILE_NAME=production-server
IMAGE_ID=ami-405f7226
INSTANCE_TYPE=t2.medium
IMPTIME_CONF_ZIP_URL_PARAMETER=https://s3-eu-west-2.amazonaws.com/imptime.prod.conf/external_config.zip
IMPTIME_RELEASE_ZIP_URL_PARAMETER=https://s3-eu-west-2.amazonaws.com/imptime.releases/${PROD_ZIP_FILENAME}
KEY_NAME=imptime-production-devops
NAME="ImpTime (Production - $STACK_NUMBER)"
PUBLIC_SUBNET_PARAMETER=subnet-3fc12676
SECURITY_GROUP_PARAMETER=sg-fbaf7f82
STACK_NAME=Production$STACK_NUMBER

if [ -z ${STACK_NUMBER} ]
then
    echo "Usage: create_imptime_application-server.sh <stack number>"
    exit 1;
fi

aws cloudformation validate-template \
    --profile $AWS_PROFILE_NAME \
    --region $AWS_REGION \
    --template-body file://$BASE_DIR/aws/cloud_formation_templates/imptime_application_server.cfn.yml \

if [ $? -ne 0 ]
then
  echo "Exiting after CloudFormation template failed to validate." >&2
  exit 1
fi

aws cloudformation create-stack \
    --profile $AWS_PROFILE_NAME \
    --region $AWS_REGION \
    --stack-name $STACK_NAME \
    --template-body file://$BASE_DIR/aws/cloud_formation_templates/imptime_application_server.cfn.yml \
    --parameters \
        ParameterKey=IAMInstanceProfileNameParameter,ParameterValue=$IAM_INSTANCE_PROFILE_NAME \
        ParameterKey=ImageIdParameter,ParameterValue=$IMAGE_ID \
        ParameterKey=InstanceTypeParameter,ParameterValue=$INSTANCE_TYPE \
        ParameterKey=ImptimeConfZipUrlParameter,ParameterValue=$IMPTIME_CONF_ZIP_URL_PARAMETER \
        ParameterKey=ImptimeReleaseZipUrlParameter,ParameterValue=$IMPTIME_RELEASE_ZIP_URL_PARAMETER \
        ParameterKey=KeyNameParameter,ParameterValue=$KEY_NAME \
        "ParameterKey=NameParameter,ParameterValue=$NAME" \
        ParameterKey=PublicSubnetParameter,ParameterValue=$PUBLIC_SUBNET_PARAMETER \
        ParameterKey=SecurityGroupParameter,ParameterValue=$SECURITY_GROUP_PARAMETER
