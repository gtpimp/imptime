#!/bin/bash

set -e

cd "`dirname \"$0\"`/"
ROOT=`pwd`

AWS_CONFIG=$1
AWS_PROFILE=$2

if [ -z "${AWS_CONFIG}" ]; then
   AWS_CONFIG=~/.aws
   echo "Auto setting AWS_CONFIG variable to ${AWS_CONFIG}. Pass in as first variable to over-ride"
fi

if [ -z "${AWS_PROFILE}" ]; then
   AWS_PROFILE="imptime_production_devops"
   echo "Auto setting AWS_PROFILE variable to ${AWS_PROFILE}. Pass in as second variable to over-ride"
fi

if [ ! -e ${AWS_CONFIG} ] || [ ! -e ${AWS_CONFIG}/credentials ]; then
    echo "You must have valid amazon configuration at ${AWS_CONFIG}, with a section for '${AWS_PROFILE}'"
    echo "You won't be able to deploy releases to amazon, press enter to continue"
    read -p " (press enter)" DUMMY
fi


# Note we bind the docker.sock so docker in the container can talk to
# the host docker. But note that dockers launched inside this
# container will use volumes mapped to the host. So create a single
# big volume that the deployer can give to any created dockers.
MAPPED_TEMP_FOLDER=${ROOT}/deployer_temp

if [ -e ${MAPPED_TEMP_FOLDER} ]; then
    echo "Clean the temp folder at ${MAPPED_TEMP_FOLDER}?"
    echo "Select yes for a 'pure' build, select no for a quicker build"
    read -p "(y/n) " DUMMY
    if [ $DUMMY == "y" ]; then
        echo "About to clean the temp folder at ${MAPPED_TEMP_FOLDER}. Because the deployer runs as a docker root, this delete requires root permissions"
        sudo rm -Rf ${MAPPED_TEMP_FOLDER}
    fi
fi
mkdir -p ${MAPPED_TEMP_FOLDER}

# Because we're a level deep, the docker can't see the config folder,
# but it needs it, so just copy it in.
cp -R config ${MAPPED_TEMP_FOLDER}/

if [ -z ${SSH_AUTH_SOCK} ]; then
    echo "You must have ssh-agent running, running for you: "
    eval `ssh-agent`
fi
echo "Trying to add default key, ignore if this fails but you might not be able to access git from inside the deplod docker"
ssh-add ~/.ssh/id_rsa

DOCKER_SOCK=/var/run/docker.sock
if [ ! -e ${DOCKER_SOCK} ]; then
    echo "You must have the docker server running locally"
    echo "Couldn't find the sock file at ${DOCKER_SOCK}"

    read -p "Attempt to auto install on ubuntu xenial? (y/n) " DUMMY
    if [ ${DUMMY} != "y" ]; then
        exit 1
    fi
    sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
    sudo apt-add-repository 'deb https://apt.dockerproject.org/repo ubuntu-xenial main'
    sudo apt-get update
    sudo apt-get install -y docker-engine
    sudo usermod -aG docker $(whoami)
    if [ ! -e ${DOCKER_SOCK} ]; then
        echo "Failed to install docker"
        exit 1
    fi

    echo "Docker installed. You will need to ssh out and back in again for permissions to take affect"
    exit 1
fi

echo "Building the deployer docker"
docker build -f Dockerfile-deployer -t deployer .

echo "Entering deployer docker"
echo "-----"
echo "SUCCESS. "
echo " "
echo " To make a production release : "
echo " 1) Get access to the deploy machine:"
echo "     fab host_deploy allow_ip"
echo " 2) Connect to deploy machine (exit run_deployer first):"
echo "     ./ssh_to_deployer.sh "
echo "     # ./run_deployer.sh"
echo " 3) Create the release:"
echo "     $ fab host_production branch:prod release_and_deploy"
echo " .) Roll back the previous release (in case of failure):"
echo "     $ fab host_production branch:prod rollback"
echo ""
echo " To setup development environment : "
echo " $ fab host_local branch:xxx build_all_dev_images"
echo " $ fab host_local branch:xxx dev_on"
echo " ... then follow onscreen instructions  "
echo " "


docker run -i -t --env GUESSED_DEV_CODE_ROOT_FOLDER=$ROOT/  --env SSH_AUTH_SOCK=/ssh-agent --env MAPPED_TEMP_FOLDER_ON_HOST=${MAPPED_TEMP_FOLDER} --env AWS_PROFILE=${AWS_PROFILE} --volume $SSH_AUTH_SOCK:/ssh-agent --volume ${DOCKER_SOCK}:/var/run/docker.sock --volume ${ROOT}/deployer_temp:/opt/imptime/deployer/mapped_temp --volume ${AWS_CONFIG}:/root/.aws  --volume ~/.ssh:/opt/imptime/local_ssh_keys deployer bash
