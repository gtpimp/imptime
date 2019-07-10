#!/bin/bash

trap "exit" SIGHUP SIGINT SIGTERM

cd "`dirname \"$0\"`"

FORCE_RENEW=$1
if [ -z "${FORCE_RENEW}" ]; then
    FORCE_RENEW=0
fi

if [ -z "$CERTS_PATH" ]; then
    echo "No CERTS_PATH set"
    exit 1
fi

if [ -z "$WEBROOT_PATH" ]; then
    echo "No WEBROOT_PATH set"
    exit 1
fi

if [ -z "$EMAIL" ] ; then
  echo "No email set, please fill -e 'EMAIL=your@email.tld'"
  exit 1
fi

CHECK_FREQ=1

echo "Updating certbot-auto"
apt update
apt install -y wget
wget https://dl.eff.org/certbot-auto
chmod a+x ./certbot-auto

check() {
  echo "* Starting webroot initial certificate request script..."

  DOMAINS=`cat /opt/imptime/domains/list.txt`
  DOMAINS=(${DOMAINS})
  CERTBOT_DOMAINS=("${DOMAINS[*]/#/--domain }")
  if [ -z "$DOMAINS" ]; then
      echo "No domains set"
  else
      if [ $FORCE_RENEW == 1 ]; then
          echo "Forcing renew"
          ./certbot-auto certonly --force-renew --webroot --agree-tos --noninteractive --text --expand \
                  --preferred-challenges http \
                  --email ${EMAIL} \
                  --webroot-path ${WEBROOT_PATH}
      else
          ./certbot-auto certonly --webroot --agree-tos --noninteractive --text --expand \
                  --preferred-challenges http \
                  --email ${EMAIL} \
                  --webroot-path ${WEBROOT_PATH} \
                  ${CERTBOT_DOMAINS}
      fi

      echo "* Certificate request process finished for domain $DOMAINS"

      if [ "$CERTS_PATH" ] ; then
        echo "* Copying certificates to $CERTS_PATH"
        eval cp -f -R -L --remove-destination /etc/letsencrypt/live/* $CERTS_PATH/
      fi

      if [ "$NGINX_DOCKER_COMPOSE_NAME" ]; then
          echo "* Reloading Nginx configuration on $NGINX_DOCKER_COMPOSE_NAME"
          docker kill -s HUP `docker ps | grep ${NGINX_DOCKER_COMPOSE_NAME} | head -n 1 | awk '{ print $1 }'`
      fi
  fi

  echo "* Next check in $CHECK_FREQ days"
  sleep ${CHECK_FREQ}d
  check
}

check
