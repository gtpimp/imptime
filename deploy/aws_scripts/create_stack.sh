#!/usr/bin/env bash

STACK_NAME=$1
TEMPLATE_BODY_PATH=$2
INTERNAL_RELEASE_NUMBER=$3
ELASTIC_IP_ALLOCATION_ID=$5
VOLUME_ID=$6
STATIC_HASH=$(echo $7 | cut -c1-7)
PROFILE_NAME=$8
TEMPLATE_BODY=$(cat "$TEMPLATE_BODY_PATH")

stack_created() {
    COUNT=$(aws cloudformation list-stacks --region=eu-west-1 --profile=$PROFILE_NAME | jq '[ .StackSummaries[] | select((.StackName | contains("'"$STACK_NAME"'")) and .StackStatus != "CREATE_COMPLETE") ] | length')
    if [ "$COUNT" -gt 0 ]; then
        return 0
    else
        return 1
    fi
}

STARTTIME=$(date +%s)
echo "creating stack $STACK_NAME"

aws cloudformation --profile=$PROFILE_NAME --region=eu-west-1 create-stack --stack-name $STACK_NAME --capabilities CAPABILITY_IAM --template-body="$TEMPLATE_BODY" --parameters ParameterKey=InternalReleaseNumber,ParameterValue=$INTERNAL_RELEASE_NUMBER ParameterKey=ElasticIpAllocationId,ParameterValue=$ELASTIC_IP_ALLOCATION_ID ParameterKey=VolumeId,ParameterValue=$VOLUME_ID ParameterKey=StaticHash,ParameterValue=$STATIC_HASH || { echo 'create-stack command failed' ; exit 1; }

#TODO stop on rollback
until stack_created; do
  >&2 echo "creating stack $1 ..."
  sleep 20
done

ENDTIME=$(date +%s)

>&2 echo "stack $1 created ($(($ENDTIME - $STARTTIME)) seconds)"

