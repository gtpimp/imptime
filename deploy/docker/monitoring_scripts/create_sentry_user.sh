
SENTRY_WEB_CONTAINER_ID=`docker ps | grep sentry-web | awk '{ print $1 }'`

docker exec -it ${SENTRY_WEB_CONTAINER_ID} sentry createuser

