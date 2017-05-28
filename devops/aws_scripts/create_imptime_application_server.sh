#!/usr/bin/env bash

cd "`dirname \"$0\"`/.."
BASE_DIR=$(pwd)

# This is used to keep the stack numbers unique, enter a sequence number
STACK_NUMBER=$1
if [ -z "${STACK_NUMBER}" ]; then
    echo "You must give a unique stack number as first parameter"
    exit 1
fi

TARGET_SERVER=$2
if [ -z "${TARGET_SERVER}" ]; then
    echo "You must supply a target server, one of [production,staging]"
    exit 1
fi

SERVER_TYPE=$3
if [ -z "${SERVER_TYPE}" ]; then
    echo "You must supply a server type, one of [application, proxy, monitoring]"
    exit 1
fi

ZIP_FILENAME=$4
if [ -z "${ZIP_FILENAME}" ]; then
    ZIP_FILENAME="imptime_${TARGET_SERVER}_`date +%d%B%Y_%H%M%S`.zip"
    echo "Auto setting zip file to: ${ZIP_FILENAME}"
    echo "To change this, pass as the second parameter"
fi


# Must match a name in your credentials
AWS_PROFILE_NAME=imptime_devops_${TARGET_SERVER}

AWS_REGION=eu-west-2
IAM_INSTANCE_PROFILE_NAME=${TARGET_SERVER}_server
IMAGE_ID=ami-f1d7c395
INSTANCE_TYPE=t2.medium
IMPTIME_CONF_ZIP_URL_PARAMETER=https://s3-${AWS_REGION}.amazonaws.com/imptime.${TARGET_SERVER}.conf/${SERVER_TYPE}_external_config.zip
IMPTIME_RELEASE_ZIP_URL_PARAMETER=https://s3-${AWS_REGION}.amazonaws.com/imptime.releases/${ZIP_FILENAME}
KEY_NAME=imptime_${TARGET_SERVER}_devops
EC2_INSTANCE_NAME="ImpTime ${TARGET_SERVER} - ${SERVER_TYPE} - ${STACK_NUMBER}"
PUBLIC_SUBNET_PARAMETER=subnet-41aa920b
SECURITY_GROUP_PARAMETER=sg-6238ab0b
STACK_NAME=${EC2_INSTANCE_NAME}$STACK_NUMBER

echo "Validating template"
aws cloudformation validate-template \
    --profile $AWS_PROFILE_NAME \
    --region $AWS_REGION \
    --template-body file://$BASE_DIR/aws/cloud_formation_templates/imptime_application_server.cfn.yml \
    
if [ $? -ne 0 ]
then
  echo "Exiting after CloudFormation template failed to validate." >&2
  exit 1
fi

echo "Template validated"


echo "Creating stack"
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
        "ParameterKey=NameParameter,ParameterValue=${EC2_INSTANCE_NAME}" \
        ParameterKey=PublicSubnetParameter,ParameterValue=$PUBLIC_SUBNET_PARAMETER \
        ParameterKey=SecurityGroupParameter,ParameterValue=$SECURITY_GROUP_PARAMETER

echo "Stack created"
