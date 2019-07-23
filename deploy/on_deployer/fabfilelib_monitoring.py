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
from fabfilelib_aws import *
from fabfilelib_rds import *
from fabfilelib_docker import *
from fabfilelib_git import *

def release_monitoring():
    build_all_monitoring_images()
    package_file = package_all_monitoring(upload=True,
                                          name_prefix="monitoring_%s" % env.branch)
    print("Success: Uploaded zip, local version as at %s" % package_file)

def build_all_monitoring_images():
    """ Builds everything needed for monitoring and logging """
    build_nginx_monitoring_image()
    build_letsencrypt_monitoring_image()
    build_logstash_image()
    build_kibana_image()
    print("Success: All monitoring images created")

def build_nginx_monitoring_image(build_args=None):
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    short_hash = git_local_short_hash(checked_out_code_folder)

    # Skip compilation
    compiled_code_folder = checked_out_code_folder

    # Build the api image against the compiled code
    docker_file = get_cache_corrected_docker_file(os.path.join(checked_out_code_folder,
                                                                "docker",
                                                                "Dockerfile-nginx"),
                                                   output_folder=compiled_code_folder)

    build_from_dockerfile(compiled_code_folder,
                           docker_file,
                           image_name="imptime/nginx-monitoring",
                           tag_name=short_hash)

    print("Success: Nginx monitoring image created")

def build_letsencrypt_monitoring_image(build_args=None):
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    short_hash = git_local_short_hash(checked_out_code_folder)

    # Skip compilation
    compiled_code_folder = checked_out_code_folder

    # Build the api image against the compiled code
    docker_file = get_cache_corrected_docker_file(os.path.join(checked_out_code_folder,
                                                                "docker",
                                                                "Dockerfile-letsencrypt"),
                                                   output_folder=compiled_code_folder)

    build_from_dockerfile(compiled_code_folder,
                           docker_file,
                           image_name="imptime/letsencrypt-monitoring",
                           tag_name=short_hash)

    print("Success: Letsencrypt image created")

def build_logstash_image():
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    short_hash = git_local_short_hash(checked_out_code_folder)
    build_folder = get_temp_build_dir(git_repo)
    docker_file = get_cache_corrected_docker_file(os.path.join(checked_out_code_folder,
                                                                "docker",
                                                                "Dockerfile-logstash"),
                                                   output_folder=build_folder)
    build_from_dockerfile(build_folder,
                           docker_file,
                           image_name="imptime/logstash",
                           tag_name=short_hash)

def build_kibana_image():
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    short_hash = git_local_short_hash(checked_out_code_folder)
    build_folder = get_temp_build_dir(git_repo)
    docker_file = get_cache_corrected_docker_file(os.path.join(checked_out_code_folder,
                                                                "docker",
                                                                "Dockerfile-kibana"),
                                                   output_folder=build_folder)
    build_from_dockerfile(build_folder,
                           docker_file,
                           image_name="imptime/kibana",
                           tag_name=short_hash)

def package_all_monitoring(upload=False, name_prefix=None):
    upload = upload == '1' or upload == True
    build_folder = get_temp_build_dir("packaged")
    images_folder_name = "images"
    install_folder_name = "docker_compose"
    images_folder = get_temp_build_dir(os.path.join(build_folder, images_folder_name))
    docker_compose_folder = os.path.join(build_folder, install_folder_name)
    with lcd(build_folder):
        local("mkdir -p {docker_compose_folder}".format(docker_compose_folder=docker_compose_folder))
        
    export_all_monitoring(images_folder)
    
    package_monitoring_docker_compose(output_folder=docker_compose_folder)
    return package_images(build_folder,
                          name_prefix=name_prefix or env.branch,
                          upload=upload,
                          extra_folders=[install_folder_name],
                          source_folder=images_folder_name)

def export_all_monitoring(build_folder=None):
    short_hash = git_remote_short_hash('imptime')
    images_folder = build_folder or get_temp_build_dir("images")
    export_image("imptime/logstash", image_tag=short_hash, dest_folder=images_folder)
    export_image("imptime/kibana", image_tag=short_hash, dest_folder=images_folder)
    export_image("imptime/nginx-monitoring", image_tag=short_hash, dest_folder=images_folder)
    export_image("imptime/letsencrypt-monitoring", image_tag=short_hash, dest_folder=images_folder)

def package_monitoring_docker_compose(output_folder=None):
    output_folder = output_folder or get_temp_build_dir("docker_monitoring_compose")
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    original_docker_compose_file = os.path.join(checked_out_code_folder, "docker", "docker-compose-monitoring-server.yml")

    tokens = { "__TOKEN_IMPTIME_MONITORING_SHORT_GIT_HASH__": git_remote_short_hash('imptime') }
    new_docker_compose_file = replace_tokens_in_file(original_docker_compose_file, tokens=tokens)

    output_file_path = os.path.join(output_folder, "docker-compose-monitoring-server.yml")
    with lcd(checked_out_code_folder, "deploy"):
        local("mv {new_docker} {output_file_path}".format(new_docker=new_docker_compose_file,
                                                          output_file_path=output_file_path))

    with lcd(checked_out_code_folder):
        local("cp -R deploy/docker/monitoring_scripts/* {output_folder}".format(output_folder=output_folder))
        local("cp deploy/docker/docker-compose-elasticsearch.yml {output_folder}".format(output_folder=output_folder))

    local("cp -R /opt/imptime/config/monitoring_sample/* {output_folder}"\
          .format(branch=env.branch, output_folder=output_folder))
        
    print("\nSuccess. \nDocker compose file created for branch {branch} at: {output_file_path}"\
          .format(branch=env.branch, output_file_path=output_file_path))
    return output_file_path

def deploy_monitoring(zip_filename):
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)

    stack_number = get_next_stack_number()
    stack_name = "%s%d" % (env.stack_name_prefix, stack_number)
    cloud_formation_template_path=os.path.join(checked_out_code_folder, "aws",
                                               "cloud_formation_templates",
                                               "imptime_monitoring_server.cfn.yml")
    ec2_instance_name="Imptime_{target_server}_{server_type}_{stack_number}".format(
        target_server=env.target_server,
        server_type=env.server_type,
        stack_number=stack_number)

    imptime_conf_zip_url_parameter="https://s3-{aws_region}.amazonaws.com/imptime.{target_server}.conf/{external_config_zip_name}".format(
        aws_region=env.aws_region,
        target_server=env.target_server,
        server_type=env.server_type,
        external_config_zip_name=env.external_config_zip_name)
    imptime_release_zip_url_parameter="https://s3-{aws_region}.amazonaws.com/{aws_bucket_name}/{zip_filename}".format(
        aws_region=env.aws_region,
        target_server=env.target_server,
        aws_bucket_name=env.s3_bucket_name_releases,
        zip_filename=zip_filename)
    
    with lcd(os.path.join(checked_out_code_folder, "deploy", "aws_scripts")):
        print("Validating template")
        local(("aws cloudformation validate-template " +
               "--profile {aws_profile_name} " +
               "--region {aws_region} " +
               "--template-body file://{cloud_formation_template_path}").format(
                   aws_profile_name=env.aws_deploy_profile_name,
                   aws_region=env.aws_region,
                   cloud_formation_template_path=cloud_formation_template_path))
        
        print("Creating stack")
        stack_create_response = local(("aws cloudformation create-stack " +
                                       "--profile {aws_profile_name} " +
                                       "--region {aws_region} " +
                                       "--stack-name {stack_name} " +
                                       "--template-body file://{cloud_formation_template_path} " +
                                       "--parameters " +
                                       "ParameterKey=IAMInstanceProfileNameParameter,ParameterValue={iam_instance_profile_name} " +
                                       "ParameterKey=ImageIdParameter,ParameterValue={image_id} " +
                                       "ParameterKey=InstanceTypeParameter,ParameterValue={instance_type} " +
                                       "ParameterKey=ImptimeConfZipUrlParameter,ParameterValue={imptime_conf_zip_url_parameter} " +
                                       "ParameterKey=ImptimeReleaseZipUrlParameter,ParameterValue={imptime_release_zip_url_parameter} " +
                                       "ParameterKey=ExternalConfigBucketNameParameter,ParameterValue={external_config_bucket_name_parameter} " +
                                       "ParameterKey=ReleasesBucketNameParameter,ParameterValue={releases_bucket_name_parameter} " +
                                       "ParameterKey=KeyNameParameter,ParameterValue={key_name} " +
                                       "\"ParameterKey=NameParameter,ParameterValue={ec2_instance_name}\" " +
                                       "ParameterKey=PublicSubnetParameter,ParameterValue={public_subnet_parameter} " +
                                       "ParameterKey=SecurityGroupParameter,ParameterValue={security_group_parameter}").format(
                                           aws_profile_name=env.aws_deploy_profile_name,
                                           aws_region=env.aws_region,
                                           stack_name=stack_name,
                                           cloud_formation_template_path=cloud_formation_template_path,
                                           iam_instance_profile_name=env.aws_iam_instance_profile_name,
                                           image_id=env.aws_image_id,
                                           instance_type=env.aws_instance_type,
                                           imptime_conf_zip_url_parameter=imptime_conf_zip_url_parameter,
                                           imptime_release_zip_url_parameter=imptime_release_zip_url_parameter,
                                           external_config_bucket_name_parameter=env.s3_bucket_name_external_config,
                                           releases_bucket_name_parameter=env.s3_bucket_name_releases,
                                           key_name=env.aws_key_name,
                                           ec2_instance_name=ec2_instance_name,
                                           public_subnet_parameter=env.aws_public_subnet,
                                           security_group_parameter=env.aws_security_group
                                       ),
                                      capture=True)

        print(stack_create_response)
        wait_for_stack_create_complete(stack_name)
        server_dns = get_aws_instance_server_data(ec2_instance_name)["PublicDnsName"]
        print("Created monitoring server: Instance %s at %s" % (ec2_instance_name, server_dns))

def update_monitoring_dns(dns_subdomain='monitoring', aws_monitoring_instance_name=None):
    aws_monitoring_instance_data = get_best_monitoring_instance_data(aws_monitoring_instance_name=aws_monitoring_instance_name)
    if aws_monitoring_instance_data is None:
        print("No monitoring dns found")
        return
    monitoring_dns = aws_monitoring_instance_data["PublicDnsName"]
    monitoring_ip = aws_monitoring_instance_data["PublicIpAddress"]
    print("Monitoring dns is %s, ip is %s" % (monitoring_dns,monitoring_ip))
    if monitoring_dns is None:
        return("No PublicDnsName found for {instance_name}".format(instance_name=aws_monitoring_instance_name))
    set_aws_dns_entry(monitoring_ip, dns_subdomain=dns_subdomain,
                      subsubdomains=["", "sentry", "prometheus", "kibana", "grafana", "logstash", "unsee", "alertmanager"])
    
def get_best_monitoring_instance_data(aws_monitoring_instance_name=None):
    if aws_monitoring_instance_name is None:
        aws_monitoring_stack_name = confirm_best_guess_active_stack_name()
        if aws_monitoring_stack_name is None:
            print("No active monitoring stack found")
            return
        else:
            print("Assuming active monitoring server stack name is %s" % aws_monitoring_stack_name)
        aws_instance_data = get_aws_instance_data_from_stack_name(aws_monitoring_stack_name)
    else:
        aws_instance_data = get_aws_instance_server_data(aws_monitoring_instance_name)
    return aws_instance_data
