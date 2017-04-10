#!/usr/bin/env bash

set -e

cd /opt/imptime/ui/
python manage.py wait_for_flag ui_db_migrate_complete

daphne imptime.asgi:channel_layer -b 0.0.0.0 -p 8004
