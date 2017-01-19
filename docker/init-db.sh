#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username postgres <<-EOSQL
    CREATE ROLE imp WITH LOGIN PASSWORD 'imptime';
    CREATE DATABASE imptime;
    GRANT ALL PRIVILEGES ON DATABASE imptime TO imp;
    GRANT SELECT ON ALL TABLES IN SCHEMA PUBLIC TO imp;
EOSQL

pg_restore --username postgres -d imptime /imptime_sanitized.pgdump
