#!/usr/bin/env bash

STACK_NAME=$1
PROFILE_NAME=$2

stack_deleted() {
    COUNT=$(aws cloudformation list-stacks --region=eu-west-1 --profile=$PROFILE_NAME | jq '[ .StackSummaries[] | select((.StackName | contains("'"$STACK_NAME"'")) and .StackStatus != "DELETE_COMPLETE") ] | length')
    if [ "$COUNT" -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

if stack_deleted; then
    echo 'nothing to do'; exit 0;
else
    echo "deleting stack"
    aws cloudformation --profile=$PROFILE_NAME --region=eu-west-1 delete-stack --stack-name $STACK_NAME || { echo 'delete-stack command failed' ; exit 1; }

    until stack_deleted; do
      >&2 echo "deleting stack $1 ..."
      sleep 10
    done

    >&2 echo "stack $1 deleted"
fi
