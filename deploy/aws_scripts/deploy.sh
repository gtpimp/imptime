#!/usr/bin/env bash

cd "`dirname \"$0\"`/.."
ROOT=`pwd`
DIST=$ROOT/dist

CONFIG_DIR=
ELASTIC_IP_ALLOCATION_ID=
FILENAME=
HOST=
IDENTITY_FILE=
AWS_PROFILE_NAME=
STACK_NAME=
TAG=
VOLUME_ID=


stack_created() {
    COUNT=$(aws cloudformation list-stacks --region=eu-west-1 --profile=$AWS_PROFILE_NAME | jq '[ .StackSummaries[] | select((.StackName | contains("'"$STACK_NAME"'")) and .StackStatus != "CREATE_COMPLETE") ] | length')
    if [ "$COUNT" -gt 0 ]; then
        return 0
    else
        return 1
    fi
}

stack_deleted() {
    COUNT=$(aws cloudformation list-stacks --region=eu-west-1 --profile=$AWS_PROFILE_NAME | jq '[ .StackSummaries[] | select((.StackName | contains("'"$STACK_NAME"'")) and .StackStatus != "DELETE_COMPLETE") ] | length')
    if [ "$COUNT" -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

while getopts "a:d:e:f:h:i:p:s:t:v:" OPT; do
    case $OPT in
        d) CONFIG_DIR=$OPTARG ;;
        e) ELASTIC_IP_ALLOCATION_ID=$OPTARG ;;
        f) FILENAME=$OPTARG ;;
        h) HOST=$OPTARG ;;
        i) IDENTITY_FILE=$OPTARG ;;
        p) AWS_PROFILE_NAME=$OPTARG ;;
        s) STACK_NAME=$OPTARG ;;
        t) TAG=$OPTARG ;;
        v) VOLUME_ID=$OPTARG ;;
        \?) help ;;
    esac
done

TEMPLATE_BODY_PATH=$ROOT/cloudformation/SelfContained.cfn.json
TEMPLATE_BODY=$(cat "$TEMPLATE_BODY_PATH")

OUTPUT_FILE=$DIST/$FILENAME

if [ -z "$CONFIG_DIR" ]; then
    echo "Please specify config directory"
    exit 1
fi

if [ ! -d "$CONFIG_DIR" ]; then
    echo "$CONFIG_DIR does not exist"
elif [ ! -d "$CONFIG_DIR/external_config" ]; then
    echo "$CONFIG_DIR does not contain external_config directory"
fi

if [ -z "$FILENAME" ]; then
    echo "Please specify output filename"
    exit 1
fi

if [ -z "$AWS_PROFILE_NAME" ]; then
    echo "Please set AWS profile name"
    exit 1
fi

if [ -z "$HOST" ]; then
    echo "Please set host"
    exit 1
fi

if [ -z "$IDENTITY_FILE" ]; then
    echo "Please set identity file"
    exit 1
fi

if [ -z "$STACK_NAME" ]; then
    echo "Please set stack name"
    exit 1
fi

if [ -z "$TAG" ]; then
    echo "Please set tag"
    exit 1
fi

if [ -z "$ELASTIC_IP_ALLOCATION_ID" ]; then
    echo "Please set Elastic IP Allocation ID"
    exit 1
fi

if [ -z "$VOLUME_ID" ]; then
    echo "Please set Volume ID"
    exit 1
fi

echo 'Uploading config ...'

mkdir -p dist
rm -f $OUTPUT_FILE
cd $CONFIG_DIR/external_config && zip -r $OUTPUT_FILE * .[!.]*
cd $ROOT

aws s3 cp --region eu-west-1 --profile $AWS_PROFILE_NAME $OUTPUT_FILE s3://katalyst-environments

if stack_deleted; then
    echo 'No stack to delete.'
else
    echo 'Bring down Docker containers ...'
    ssh -i $IDENTITY_FILE -o StrictHostKeyChecking=no "ec2-user@$HOST" 'cd /opt/katalyst && ./docker-compose -f docker-compose.yml down'

    echo 'Unmounting /katalyst-media ...'
    ssh -i $IDENTITY_FILE -o StrictHostKeyChecking=no "ec2-user@$HOST" 'if mount | grep /katalyst-media; then echo umount /katalyst-media; else echo "/katalyst-media not mounted"; fi'

    echo "Deleting stack ..."

    aws cloudformation --profile=$AWS_PROFILE_NAME --region=eu-west-1 delete-stack --stack-name $STACK_NAME || { echo 'delete-stack command failed' ; exit 1; }

    until stack_deleted; do
      >&2 echo "deleting stack $1 ..."
      sleep 10
    done

    >&2 echo "Stack $1 deleted."
fi

STARTTIME=$(date +%s)
echo "Creating stack $STACK_NAME ..."

aws cloudformation \
 --profile=$AWS_PROFILE_NAME_NAME \
 --region=eu-west-1 create-stack \
 --stack-name $STACK_NAME \
 --capabilities CAPABILITY_IAM \
 --template-body="$TEMPLATE_BODY" \
 --parameters ParameterKey=InternalReleaseNumber,ParameterValue=$TAG \
 ParameterKey=ElasticIpAllocationId,ParameterValue=$ELASTIC_IP_ALLOCATION_ID \
 ParameterKey=VolumeId,ParameterValue=$VOLUME_ID \
 || { echo 'create-stack command failed' ; exit 1; }

#TODO stop on rollback
until stack_created; do
  >&2 echo "creating stack $1 ..."
  sleep 20
done

ENDTIME=$(date +%s)

>&2 echo "stack $1 created ($(($ENDTIME - $STARTTIME)) seconds)"

echo 'Waiting for services ...'

wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
chmod +x wait-for-it.sh
./wait-for-it.sh $HOST:80 --timeout=900
./wait-for-it.sh $HOST:8006 --timeout=120
./wait-for-it.sh $HOST:8007 --timeout=120
./wait-for-it.sh $HOST:8008 --timeout=120
