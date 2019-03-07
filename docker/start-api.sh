#!/usr/bin/env bash

set -e

cd /opt/imptime/api
python manage.py wait_for_flag db_migrate_complete

daphne implicitdesign.asgi:channel_layer --http-timeout=500  -b 0.0.0.0 -p 8002

#gunicorn implicitdesign.wsgi -b 0.0.0.0:8002
