from fabric.api import local, settings, abort, run, cd, env, sudo, lcd
import time
import sys
import json
import yaml
import os
import getpass
import shutil
from fabric.contrib.console import confirm, prompt
from fabric.operations import put
import datetime
import re
from jinja2 import Template

from fabfilelib_git import *
from fabfilelib_docker import *

def create_database(db_name, username="imptime", password="imptime"):
    local(("aws rds create-db-instance " +
           "--profile {aws_profile_name} " +
           "--region {aws_region} " +
           "--db-name={db_name} " +
           "--db-instance-identifier={db_name} " +
           "--engine=postgres " +
           "--allocated-storage=5 " +
           "--db-instance-class={db_class} " +
           "--backup-retention-period=0 " +
           "--vpc-security-group-ids={aws_security_group} " +
           #"--db-security-groups={aws_security_group} " +
           "--db-subnet-group-name={aws_db_subnet_group_name} " +
           "--master-username={username} " +
           "--master-user-password={password} ").format(
               aws_profile_name=env.aws_deploy_profile_name,
               aws_region=env.aws_region,
               db_name=db_name,
               username=username,
               password=password,
               db_class="db.t2.medium",
               aws_security_group=env.aws_security_group,
               aws_db_subnet_group_name=env.aws_db_subnet_group_name
           ))
    print("Creating database: name=%s, username=%s, password=%s" % (db_name, username, password))
    db_instance_data = wait_for_rds_create_complete(db_name)
    print("Created database. DNS endpoint is %s" % db_instance_data["Endpoint"]["Address"])

def get_db_instance_data(db_name):
    aws_response = local(("aws rds describe-db-instances " +
                          "--profile {aws_profile_name} " +
                          "--region {aws_region} " +
                          "--db-instance-identifier {db_name} "
                          ).format(
                              aws_profile_name=env.aws_deploy_profile_name,
                              aws_region=env.aws_region,
                              db_name=db_name), capture=True)
    db_data = json.loads(aws_response)
    if len(db_data['DBInstances']) == 0:
        return None
    db_instance_data = db_data['DBInstances'][0]
    return db_instance_data

def list_databases():
    aws_response = local(("aws rds describe-db-instances " +
                          "--profile {aws_profile_name} " +
                          "--region {aws_region} "
                          ).format(
                              aws_profile_name=env.aws_deploy_profile_name,
                              aws_region=env.aws_region), capture=True)
    db_data = json.loads(aws_response)
    if len(db_data['DBInstances']) == 0:
        print("No databases")
    for db in db_data['DBInstances']:
        db_name = db['DBName'] if 'DBName' in db else '__No db name__'
        print "%s : %s" % (db_name.ljust(30), db['Endpoint']['Address'])

def wait_for_rds_create_complete(db_name):
    pending_status = "creating"
    current_status = pending_status
    while current_status == pending_status:
        time.sleep(20)
        db_instance_data =get_db_instance_data(db_name)
        
        if db_instance_data is None:
            print("No database found called %s, trying again" % db_name)
        else:
            current_status = db_instance_data['DBInstanceStatus']
            print("Status of db %s is %s" % (db_name, current_status))
    return db_instance_data

def endpoint_for_database(db_name):
    db_instance_data =get_db_instance_data(db_name)
    print("DNS endpoint for {db_name} is {endpoint}".format(
        db_name=db_name,
        endpoint=db_instance_data["Endpoint"]["Address"]))
