#!/usr/bin/env bash

if [ -z "$STATIC_ASSETS_HASH" ]; then
    echo "Error: No STATIC_ASSETS_HASH environment variable supplied"
    exit 1
fi

STATIC_ASSETS_PATH="/opt/imptime/global/static_collected/$STATIC_ASSETS_HASH/"
echo "Using hashed static_collected path: $STATIC_ASSETS_PATH"

# Copy the static content to a unique hashed path. This is for the
# django generated urls, which have a unique identifier in the path.
mkdir -p $STATIC_ASSETS_PATH
cp -R /tmp/build/reimp/build/static/* $STATIC_ASSETS_PATH
cp -R /opt/imptime/static_collected/* $STATIC_ASSETS_PATH

# Also copy the static content to the root folder. This is for the
# react generated files, which have a unique identifier in the filename.
cp -R /tmp/build/reimp/build/static/* /opt/imptime/global/static_collected/
cp -R /opt/imptime/static_collected/* /opt/imptime/global/static_collected/

# Copy the index.html and other basic files to the public folder, to
# keep them separate from the static code (nginx is configured to
# serve it differently)
mkdir -p /opt/imptime/global/static_collected/public
cp /tmp/build/reimp/build/* /opt/imptime/global/static_collected/public/
