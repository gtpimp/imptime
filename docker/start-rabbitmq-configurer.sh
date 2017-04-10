#!/usr/bin/env bash

export RABBITMQ_ERLANG_COOKIE=whoopsididitagain
echo $RABBITMQ_ERLANG_COOKIE > /var/lib/rabbitmq/.erlang.cookie
chown rabbitmq:rabbitmq /var/lib/rabbitmq/.erlang.cookie
chmod 0400 /var/lib/rabbitmq/.erlang.cookie

echo "waking up..."

function ready() {
    echo "checking if rabbitmq is available..."
    rabbitmqctl -t 5 -n rabbit@rabbitmq list_vhosts
}

ready
until [ $? -eq "0" ]; do
  echo "waiting for RabbitMQ..."
  sleep 5
  ready
done

echo "configuring RabbitMQ..."

rabbitmqctl -n rabbit@rabbitmq add_vhost /
rabbitmqctl -n rabbit@rabbitmq add_user imptime imptime
rabbitmqctl -n rabbit@rabbitmq set_permissions imptime ".*" ".*" ".*"
rabbitmqctl -n rabbit@rabbitmq list_permissions

echo "Completed configuring RabbitMQ."

cd /opt/imptime/api
python manage.py set_flag rabbitmq_ready
