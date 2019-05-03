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
from fabfilelib_monitoring import *
from fabfilelib_docker import *
from fabfilelib_git import *


def release_proxy():
    build_all_proxy_images()
    package_file = package_all_proxy(upload=True,
                                     name_prefix="proxy_%s" % env.branch)
    print("Success: Uploaded zip, local version as at %s" % package_file)

def build_all_proxy_images(build_args=None):
    build_nginx_proxy_image()
    build_letsencrypt_image()
    print("Success: All proxy images created")

def build_nginx_proxy_image(build_args=None):
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
                           image_name="imptime/nginx-proxy",
                           tag_name=short_hash)

    print("Success: Nginx proxy image created")

def build_letsencrypt_image(build_args=None):
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
                           image_name="imptime/letsencrypt",
                           tag_name=short_hash)

    print("Success: Letsencrypt image created")
    
    
def package_all_proxy(upload=False, name_prefix=None):
    upload = upload == '1' or upload == True
    build_folder = get_temp_build_dir("proxy_packaged")
    images_folder_name = "images"
    install_folder_name = "docker_compose"
    images_folder = get_temp_build_dir(os.path.join(build_folder, images_folder_name))
    docker_compose_folder = os.path.join(build_folder, install_folder_name)
    with lcd(build_folder):
        local("mkdir -p {docker_compose_folder}".format(docker_compose_folder=docker_compose_folder))

    short_hash = git_remote_short_hash('imptime')
    export_image("imptime/nginx-proxy", image_tag=short_hash, dest_folder=images_folder)
    export_image("imptime/letsencrypt", image_tag=short_hash, dest_folder=images_folder)

    package_proxy_docker_compose(output_folder=docker_compose_folder)
    return package_images(build_folder,
                          name_prefix=name_prefix or env.branch,
                          upload=(upload!=0),
                          extra_folders=[install_folder_name],
                          source_folder=images_folder_name)


def package_proxy_docker_compose(output_folder=None):
    output_folder = output_folder or get_temp_build_dir("docker_proxy_compose")
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    original_docker_compose_file = os.path.join(checked_out_code_folder, "docker", "docker-compose-proxy.yml")

    tokens = { "__TOKEN_IMPTIME_PROXY_API_SHORT_GIT_HASH__": git_remote_short_hash('imptime') }
    new_docker_compose_file = replace_tokens_in_file(original_docker_compose_file, tokens=tokens)

    output_file_path = os.path.join(output_folder, "docker-compose-proxy.yml")
    with lcd(checked_out_code_folder):
        local("mv {new_docker} {output_file_path}".format(new_docker=new_docker_compose_file,
                                                          output_file_path=output_file_path))

    with lcd(checked_out_code_folder):
        local("cp -R docker/proxy_scripts/* {output_folder}".format(output_folder=output_folder))

    local("cp -R /opt/imptime/config/proxy_sample/* {output_folder}"\
          .format(branch=env.branch, output_folder=output_folder))
        
    print("\nSuccess. \nDocker compose file created for branch {branch} at: {output_file_path}"\
          .format(branch=env.branch, output_file_path=output_file_path))
    return output_file_path

def deploy_proxy(zip_filename):
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)

    stack_number = get_next_stack_number()
    stack_name = "%s%d" % (env.stack_name_prefix, stack_number)
    cloud_formation_template_path=os.path.join(checked_out_code_folder, "aws",
                                               "cloud_formation_templates",
                                               "imptime_ssl_proxy_server.cfn.yml")
    ec2_instance_name="Imptime_{target_server}_{server_type}_{stack_number}".format(
        target_server=env.target_server,
        server_type=env.server_type,
        stack_number=stack_number)

    imptime_release_zip_url_parameter="https://s3-{aws_region}.amazonaws.com/{aws_bucket_name}/{zip_filename}".format(
        aws_region=env.aws_region,
        target_server=env.target_server,
        aws_bucket_name=env.s3_bucket_name_releases,
        zip_filename=zip_filename)
    
    with lcd(os.path.join(checked_out_code_folder, "aws_scripts")):
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
                                       "ParameterKey=ImptimeReleaseZipUrlParameter,ParameterValue={imptime_release_zip_url_parameter} " +
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
                                           imptime_release_zip_url_parameter=imptime_release_zip_url_parameter,
                                           releases_bucket_name_parameter=env.s3_bucket_name_releases,
                                           key_name=env.aws_key_name,
                                           ec2_instance_name=ec2_instance_name,
                                           public_subnet_parameter=env.aws_public_subnet,
                                           security_group_parameter=env.aws_security_group
                                       ),
                                      capture=True)

        print(stack_create_response)
        wait_for_stack_create_complete(stack_name)
        instance_data = get_aws_instance_server_data(ec2_instance_name)
        if instance_data is None:
            print("Failed to create stack")
        else:
            server_dns = instance_data["PublicDnsName"]
            print("Created proxy server: Instance %s at %s" % (ec2_instance_name, server_dns))

def update_proxy_dns(dns_subdomain="", aws_proxy_instance_name=None):
    """ updates the dns to point to this proxy """
    aws_proxy_instance_data = get_best_proxy_instance_data(aws_proxy_instance_name=aws_proxy_instance_name)
    if aws_proxy_instance_data is None:
        print("No proxy dns found")
        return
    proxy_dns = aws_proxy_instance_data["PublicDnsName"]
    proxy_ip = aws_proxy_instance_data["PublicIpAddress"]
    print("Proxy dns is %s, ip is %s" % (proxy_dns,proxy_ip))
    if proxy_dns is None:
        return("No PublicDnsName found for {instance_name}".format(instance_name=aws_proxy_instance_name))
    set_aws_dns_entry(proxy_ip, dns_subdomain=dns_subdomain,
                      subsubdomains=env.subsubdomains)

def update_proxy_destination(destination_dns, dns_subdomain="",
                             aws_proxy_instance_name=None, create_self_signed_certificates=False):
    """ updates the proxy to route calls at dns_subdomain to destination_dns """

    create_self_signed_certificates = create_self_signed_certificates in [True, "1"]
    aws_proxy_instance_data = get_best_proxy_instance_data(aws_proxy_instance_name=aws_proxy_instance_name)
    env.host_string = aws_proxy_instance_data["PublicDnsName"] # note: because env.hosts can't be changed at this point

    if len(dns_subdomain)>0:
        sites_enabled_filename = "%s.%s.conf" % (dns_subdomain, env.dns_domain)
        subdomains = [ x + "." + dns_subdomain for x in env.subsubdomains  ]
        dotted_dns_subdomain = dns_subdomain + "."
    else:
        sites_enabled_filename = "%s.conf" % (env.dns_domain)
        subdomains = env.subsubdomains
        dotted_dns_subdomain = dns_subdomain
    
    template = Template(open(os.path.join(env.deployer_dir, "templates", "nginx_proxy_server.conf")).read())
    nginx_conf = template.render(application_dns=destination_dns,
                                 dns_domain=env.dns_domain,
                                 upstream_name_suffix = dns_subdomain or "default",
                                 dotted_dns_subdomain=dotted_dns_subdomain)
    temp_folder = get_temp_build_dir("nginx_proxy")
    with open(os.path.join(temp_folder, sites_enabled_filename), "w") as f:
        f.write(nginx_conf)

    if create_self_signed_certificates:
        for subdomain in subdomains:
            upload_self_signed_certificate(subdomain, aws_proxy_instance_name=aws_proxy_instance_name)
    
    with lcd(temp_folder):
        put(sites_enabled_filename, "/opt/imptime/docker_compose/external_config/sites-enabled/")

    # Add the domain to the list of domains detected by letsencrypt
    with cd("/opt/imptime/docker_compose/external_config/ssl/domains"):
        domain_list = " ".join(["%s%s" % (x+"." if x else "", env.dns_domain) for x in subdomains])
        run("echo \" {domain_list}\" >> list.txt".format(domain_list=domain_list))
        
    # Reload nginx config
    run("docker kill -s HUP `docker ps | grep nginx | head -n 1 | awk '{ print $1 }'`")
    
def upload_self_signed_certificate(dns_subdomain, aws_proxy_instance_name=None):
    aws_proxy_instance_data = get_best_proxy_instance_data(aws_proxy_instance_name=aws_proxy_instance_name)
    env.host_string = aws_proxy_instance_data["PublicDnsName"] # note: because env.hosts can't be changed at this point

    if len(dns_subdomain)>0:
        dotted_dns_subdomain = dns_subdomain + "."
    else:
        dotted_dns_subdomain = dns_subdomain
    
    cert_folder = "%s%s" % (dotted_dns_subdomain, env.dns_domain)
    with cd("/opt/imptime/docker_compose/external_config/ssl/certs"):
        run("sudo mkdir -p %s" % cert_folder)
    with cd("/opt/imptime/docker_compose/external_config/ssl/certs/%s" % cert_folder):
        run("sudo openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj \"/C=US/ST=Denial/L=Springfield/O=Dis/CN={dns_subdomain}.{dns_domain}\" -keyout privkey.pem -out fullchain.pem".format(
            dns_subdomain=env.dns_subdomain,
            dns_domain=env.dns_domain))
        
def get_best_proxy_instance_data(aws_proxy_instance_name=None):
    if aws_proxy_instance_name is None:
        aws_proxy_stack_name = confirm_best_guess_active_stack_name()
        if aws_proxy_stack_name is None:
            print("No active proxy stack found")
            return
        else:
            print("Assuming active proxy server stack name is %s" % aws_proxy_stack_name)
        aws_instance_data = get_aws_instance_data_from_stack_name(aws_proxy_stack_name)
    else:
        aws_instance_data = get_aws_instance_server_data(aws_proxy_instance_name)
    return aws_instance_data
        
def maintenance_on(aws_proxy_instance_name=None, ip_whitelist=None):
    _set_maintenance_mode(True,
                          aws_proxy_instance_name=aws_proxy_instance_name,
                          ip_whitelist=ip_whitelist)

def maintenance_off(aws_proxy_instance_name=None):
    _set_maintenance_mode(False,
                          aws_proxy_instance_name=aws_proxy_instance_name)
    
def _set_maintenance_mode(maintenance_on=True, aws_proxy_instance_name=None, ip_whitelist=None):
    """ ip_whitelist is , separated list of ip addresses """
    ip_whitelist = (ip_whitelist or "").split(";")
    aws_instance_data = get_best_application_instance_data(aws_instance_name=aws_proxy_instance_name)
    env.host_string = aws_instance_data["PublicDnsName"] # note: because env.hosts can't be changed at this point

    template = Template(open(os.path.join(env.deployer_dir, "templates", "maintenance_mode.conf")).read())
    maintenance_mode_conf = template.render(maintenance_on=maintenance_on,
                                            ip_whitelist=ip_whitelist)
    temp_folder = get_temp_build_dir("nginx_proxy")
    with open(os.path.join(temp_folder, "maintenance_mode.conf"), "w") as f:
        f.write(maintenance_mode_conf)

    with settings(warn_only=True):
        with lcd(temp_folder):
            put("maintenance_mode.conf", "/opt/imptime/docker_compose/maintenance_conf/maintenance_mode.conf")
            run("docker kill -s HUP `docker ps | grep nginx | head -n 1 | awk '{ print $1 }'`")

                
