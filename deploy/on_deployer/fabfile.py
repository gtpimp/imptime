from fabric.api import local, settings, abort, run, cd, env, sudo, lcd
from dockerfabric.apiclient import docker_fabric as dfab
import time
import sys
import json
import yaml
import os
from dockermap.api import DockerClientWrapper, DockerFile
import getpass
import shutil
from fabric.contrib.console import confirm, prompt
from fabric.operations import put
import datetime
import re
from jinja2 import Template

from fabfilelib_general import *
from fabfilelib_proxy import *
from fabfilelib_aws import *
from fabfilelib_rds import *
from fabfilelib_application import *
from fabfilelib_monitoring import *
from fabfilelib_dev import *
from fabfilelib_docker import *
from fabfilelib_git import *


# ===== Usage =====

usage = """

Read the docs in the imptime_docs repo

"""
def help():
    print usage

# ===== hosts ======

def host_production():
    host_local()
    env.target_server='production'
    env.proxy_stack_name_prefix = "ImptimeProductionProxy"
    env.branch = 'prod'
    env.s3_bucket_name_external_config = "imptime.production.conf"
    env.external_config_zip_name = "production_application_external_config.zip"
    env.aws_iam_instance_profile_name = "production-server"
    env.aws_key_name = "imptime-ec2-access"
    env.aws_security_group="sg-bb0327d2"
    env.aws_public_subnet="subnet-41aa920b"
    env.aws_vpc="vpc-208f7d49"
    env.aws_deploy_profile_name = "imptime_production_devops"
    env.stack_name_prefix = "ImptimeProduction"
    env.dns_domain = "imptime.com"
    env.dns_internal_domain = "imptimeinternal.com"
    env.dns_internal_subdomain__live_application = "liveapplication"
    env.dns_subdomain = ""
    env.instance_name_token = "production"
    env.test_urls = [{'url': "https://app.imptime.com",
                      'regex': "<div id=\"root\""},
                     {'url': "https://api.imptime.com/accounts/login/",
                      'regex': "login"}]

def host_production_proxy():
    host_production()
    env.stack_name_prefix = env.proxy_stack_name_prefix
    env.aws_security_group="sg-d50226bc"
    env.server_type="proxy"
    env.branch = "prod"

def host_production_database():
    env.aws_security_group="sg-bc0327d5"
    env.aws_vpc="vpc-208f7d49"
    env.aws_db_subnet_group_name="production-database"
    
def host_production_monitoring():
    host_production()
    env.stack_name_prefix = "ImptimeMonitoring"
    env.aws_security_group="sg-10f8ce79"
    env.external_config_zip_name = "production_monitoring_external_config.zip"
    env.server_type="monitoring"
    env.branch = "prod"

def host_deploy():
    host_local()
    env.aws_security_group="sg-f8e2ca91"
    
def host_local():
    env.user = 'ubuntu'
    env.hosts = ['localhost']
    env.use_ssh_config = True
    env.git_url = "git@gitea.impd.co.za"
    env.git_repo_prefix = "gtp/"
    env.deployer_dir = os.path.join("/", "opt", "imptime", "deployer")
    env.mapped_temp_dir = os.path.join(env.deployer_dir, "mapped_temp")
    env.mapped_temp_dir_on_host = os.environ['MAPPED_TEMP_FOLDER_ON_HOST']
    env.nsenter_path_on_host = "/usr/local/bin/"
    env.branch = "development"
    env.max_branch_date = datetime.datetime.now()
    env.build_number = datetime.datetime.now().strftime("%d%b%Y_%H%M%S")
    env.guessed_dev_code_root_folder = os.environ['GUESSED_DEV_CODE_ROOT_FOLDER']
    env.target_server = 'not_configured'
    env.s3_aws_profile = os.environ['AWS_PROFILE']
    env.s3_bucket_name_releases = 'imptime.releases'
    env.s3_bucket_name_external_config = "imptime.%s.conf" % env.target_server
    env.aws_region="eu-west-2"
    env.aws_image_id="ami-996372fd"
    env.aws_instance_type="t2.medium"
    env.server_type="application"
    env.key_filename=os.path.join("/", "opt", "imptime", "local_ssh_keys", "imptime-ec2-access.pem")
    env.subsubdomains = ["", "www", "api"]

    
def branch(branch):
    env.branch = branch

def ssh_key(key_filename):
    env.key_filename=os.path.join("/", "opt", "imptime", "local_ssh_keys", key_filename)
    print("Using ssh key at %s" % env.key_filename)

def dns_subdomain(dns_subdomain):
    env.dns_subdomain = dns_subdomain

def sample_config_foldername(foldername):
    env.sample_config_foldername = foldername

def scripts_foldername(foldername):
    env.scripts_foldername = foldername    
