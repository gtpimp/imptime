#!/usr/bin/env bash

set -e

cd /opt/imptime/api
python3 manage.py wait_for_flag db_migrate_complete

python3 manage.py create_issues_from_incoming_aws_queue start

