#!/bin/bash

cd "`dirname \"$0\"`/../"
ROOT=`pwd`
IMAGES=${ROOT}/images

if [ ! -e ${IMAGES} ]; then
    echo "No images folder at ${IMAGES}."
    exit 1
fi

function import_docker_image {
    image_name=$1
    echo "Importing docker image: ${image_name}"
    docker load --input $image_name
}

docker --version
if [ $? != 0 ]; then
    echo "Docker needs to be installed"
    exit 1
fi

docker-compose --version
if [ $? != 0 ]; then
    echo "Docker compose needs to be installed, attempting to auto-install"
    sudo curl -o /usr/local/bin/docker-compose -L "https://github.com/docker/compose/releases/download/1.15.0/docker-compose-$(uname -s)-$(uname -m)"
    sudo chmod +x /usr/local/bin/docker-compose
    docker-compose --version
    if [ $? != 0 ]; then
        echo "Failed to install docker-compose"
        exit 1
    fi
fi

set -e

echo "Importing images"

for IMAGE in ${IMAGES}/*.image; do
    import_docker_image ${IMAGE}
done

cat << EOF

Install and upgrade complete.

           Start it up with: 
            $ ./up.sh

           To shut it down:
            $ ./down.sh

EOF

