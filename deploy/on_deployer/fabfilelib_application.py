from fabric.api import local, settings, abort, run, cd, env, sudo, lcd
from dockerfabric.apiclient import docker_fabric as dfab
import re
import time
import requests
from fabric.contrib.console import confirm, prompt
from urllib2 import urlopen
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
from fabfilelib_monitoring import *
from fabfilelib_docker import *
from fabfilelib_git import *

def release_and_deploy(aws_proxy_instance_name=None, zip_filename=None, force_backup=True, stop_old_instance=True):
    """This is the all singing all dancing version. Takes a lot of trust
       to run this one, but at the end of it a new ImpTime has arisen.
    """

    start = datetime.datetime.now()
    print("Starting at %s" %start)

    force_backup = force_backup in [True, 1, "1"]
    if not force_backup:
        print("Not running backup")

    stop_old_instance = stop_old_instance in [True, 1, "1"]
    if not stop_old_instance:
        print("Not stopping old instance")
    
    print("Confirming appropriate proxy")
    if aws_proxy_instance_name is None:
        aws_proxy_stack_name = confirm_best_guess_active_stack_name(
            stack_name_prefix=env.proxy_stack_name_prefix, hint="proxy")
        aws_proxy_instance_name = get_instance_name_from_stack_name(aws_proxy_stack_name)

    clean_dangling_images()

    if zip_filename is None:
        zip_filepath = release_application()
        zip_filename = os.path.basename(zip_filepath)
    print("Enabling maintenance mode for the deploy")
    maintenance_on(aws_proxy_instance_name=aws_proxy_instance_name,
                       ip_whitelist=get_public_ip())

    if force_backup:
        print("Creating backup using previous installation")
        previous_aws_stack_name = get_best_guess_active_stack_name()
        previous_aws_instance_name = get_instance_name_from_stack_name(previous_aws_stack_name)
        backup(previous_aws_instance_name)
    else:
        previous_aws_stack_name = None


    print("Deploying %s" % zip_filename)
    ec2_instance_name, new_stack_name = deploy_application(zip_filename)
    time.sleep(5)
    aws_instance_data = get_aws_instance_server_data(ec2_instance_name)
    print("Deployed %s to %s" % (zip_filename, ec2_instance_name))

    if stop_old_instance:
        print("Stopping all existing instances")
        with settings(warn_only=True):
            down_all_running_instances(confirm_each_server=False)
    
    print("Updating proxy dns")
    update_proxy_destination(destination_dns=aws_instance_data['PrivateDnsName'],
                             dns_subdomain=env.dns_subdomain,
                             aws_proxy_instance_name=aws_proxy_instance_name)

    print("Updating internal dns entries for monitoring")
    update_internal_application_dns(ec2_instance_name)
    
    print("Confirming the site is live")
    tries = 20
    while tries > 0:
        if sanity_check_site():
            break
        tries -= 1
        if tries == 0:
            print("***************SITE IS DOWN *********************")
            print("Deploy aborted")
            print("The site is still in maintenance mode, fix the problem and then disable maintenance mode, or roll back")
            exit()
        time.sleep(10)
            
    print("Disabling maintenance mode")
    maintenance_off(aws_proxy_instance_name=aws_proxy_instance_name)

    print("Cleaning old applications")
    if previous_aws_stack_name:
        delete_old_stacks(exclude_stack_names=[previous_aws_stack_name, new_stack_name])
    
    print("Release took: %s" % (datetime.datetime.now() - start))

    print(":) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) ")
    print("CONGRATULATIONS, your server has been deployed to %s" % ec2_instance_name)
    print(":) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) :) ")

def sanity_check_site():
    for test_url in env.test_urls:
        print("Checking %s" % test_url['url'])
        res = requests.get(test_url['url'])
        if res.status_code != 200:
            print("Failed: Status code is %s" % res.status_code)
            return False
        if re.compile(test_url['regex']).search(res.content) is None:
            print("Failed: Couldn't find %s" % test_url['regex'])
            return False
    print("Site ok")
    return True
    
def get_public_ip():
    return json.load(urlopen('https://api.ipify.org/?format=json'))['ip']

def update_internal_application_dns(ec2_instance_name=None):
    aws_instance_data = get_best_application_instance_data(ec2_instance_name)
    set_aws_dns_entry(destination_ip=aws_instance_data['PrivateIpAddress'],
                      dns_subdomain=env.dns_internal_subdomain__live_application,
                      subsubdomains=["monitoring"],
                      dns_domain=env.dns_internal_domain)
                      
def release_application():
    start = datetime.datetime.now()
    print("Starting at %s" %start)
    build_all_images()
    package_file = package_all(upload=True)
    print("Release took: %s" % (datetime.datetime.now() - start))
    print("Success: Uploaded zip, local version as at %s" % package_file)
    return package_file

def build_all_images(build_args=None):
    build_base_image()
    build_all_api_images(build_args=build_args)
    build_all_ui_images()
    build_backup_image()
    build_all_common_lib_images()
    print("Success: All images created")

def build_all_api_images(build_args=None):
    """ Meta build for everything based off the repo: imptime """
    build_api_image()
    build_nginx_image(build_args=build_args)
    print("Success: All api images created")

def build_all_ui_images(build_args=None):
    build_ui_static_assets_image()
    print("Success: All ui images created")
    
def build_all_common_lib_images():
    build_postgresql_image()
    print("Success: All common lib images created")

def build_base_image():
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    short_hash = "latest" #git_local_short_hash(checked_out_code_folder)

    # Skip compilation
    compiled_code_folder = checked_out_code_folder
        
    # Build the api image against the compiled code
    docker_file = get_cache_corrected_docker_file(os.path.join(checked_out_code_folder,
                                                                "docker",
                                                                "Dockerfile-imptime-base"),
                                                   output_folder=compiled_code_folder,
                                                   pip_requirements_file=os.path.join(compiled_code_folder,
                                                                                      "requirements.txt"))
    
    build_from_dockerfile(compiled_code_folder,
                          docker_file,
                          image_name="imptime/base",
                          tag_name=short_hash)
    
    
def build_api_image():
    """ Creates the api image onto the local machine's docker. """
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    short_hash = git_local_short_hash(checked_out_code_folder)

    # Skip compilation
    compiled_code_folder = checked_out_code_folder
        
    # Build the api image against the compiled code
    docker_file = get_cache_corrected_docker_file(os.path.join(checked_out_code_folder,
                                                                "docker",
                                                                "Dockerfile-imptime-api"),
                                                   output_folder=compiled_code_folder,
                                                   pip_requirements_file=os.path.join(compiled_code_folder,
                                                                                      "requirements.txt"))
    
    build_from_dockerfile(compiled_code_folder,
                           docker_file,
                           image_name="imptime/api",
                           tag_name=short_hash)


    
    
def build_nginx_image(build_args=None):
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    short_hash = git_local_short_hash(checked_out_code_folder)
    build_folder = get_temp_build_dir(git_repo)
    docker_file = get_cache_corrected_docker_file(os.path.join(checked_out_code_folder, "docker", "Dockerfile-nginx"),
                                                   output_folder=build_folder,
                                                   docker_tokens=build_args and build_args['nginx_docker_tokens'])

    build_from_dockerfile(build_folder,
                           docker_file,
                           image_name="imptime/nginx",
                           tag_name=short_hash)
    

def build_postgresql_image():
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    short_hash = git_local_short_hash(checked_out_code_folder)
    build_folder = get_temp_build_dir(git_repo)
    docker_file = get_cache_corrected_docker_file(os.path.join(checked_out_code_folder, "docker", "Dockerfile-postgresql"),
                                                   output_folder=build_folder)

    build_from_dockerfile(build_folder,
                           docker_file,
                           image_name="imptime/postgresql",
                           tag_name=short_hash)

def build_ui_static_assets_image():
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    short_hash = git_local_short_hash(checked_out_code_folder)

    # Skip compilation
    compiled_code_folder = checked_out_code_folder
        
    docker_file = get_cache_corrected_docker_file(os.path.join(checked_out_code_folder,
                                                                "docker",
                                                                "Dockerfile-imptime-deploy-ui-static-assets"),
                                                   output_folder=compiled_code_folder,
                                                   pip_requirements_file=os.path.join(checked_out_code_folder,
                                                                                      "requirements.txt"))
    build_from_dockerfile(compiled_code_folder,
                           docker_file,
                           image_name="imptime/ui-static-assets",
                           tag_name=short_hash)


def build_backup_image():
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    short_hash = git_local_short_hash(checked_out_code_folder)
    build_folder = get_temp_build_dir(git_repo)
    docker_file = get_cache_corrected_docker_file(os.path.join(checked_out_code_folder, "docker", "Dockerfile-backup"),
                                                   output_folder=build_folder)
    build_from_dockerfile(build_folder,
                           docker_file,
                           image_name="imptime/backup",
                           tag_name=short_hash)
    
def package_all(upload=False):
    upload = upload == '1' or upload == True
    build_folder = get_temp_build_dir("packaged")
    images_folder = get_temp_build_dir(os.path.join(build_folder, "images"))
    docker_compose_folder = os.path.join(build_folder, "docker_compose")
    run_folder = os.path.join(build_folder, "run")
    with lcd(build_folder):
        local("mkdir -p {docker_compose_folder}".format(docker_compose_folder=docker_compose_folder))
        local("mkdir -p {run_folder}".format(run_folder=run_folder))
    export_all_api(images_folder)
    export_all_ui(images_folder)
    export_backup_image(images_folder)
    export_all_common_lib(images_folder)

    package_application_docker_compose(output_folder=docker_compose_folder)
    
    return package_images(build_folder,
                          name_prefix=env.branch,
                          upload=(upload!=0),
                          extra_folders=["docker_compose", "run"])

def package_all_api(upload=False):
    upload = upload == '1' or upload == True
    build_folder = get_temp_build_dir("packaged")
    images_folder = get_temp_build_dir(os.path.join(build_folder, "images"))
    export_all_api(images_folder)
    return package_images(build_folder, name_prefix="api", upload=upload)

def package_all_ui(upload=False):
    upload = upload == '1' or upload == True
    build_folder = get_temp_build_dir("packaged")
    images_folder = get_temp_build_dir(os.path.join(build_folder, "images"))
    export_all_ui(images_folder)
    return package_images(build_folder, name_prefix="ui", upload=upload)

def package_all_common_lib(upload=False):
    upload = upload == '1' or upload == True
    build_folder = get_temp_build_dir("packaged")
    images_folder = get_temp_build_dir(os.path.join(build_folder, "images"))
    export_all_common_lib(images_folder)
    return package_images(build_folder, name_prefix="lib", upload=upload)

def export_all_ui(build_folder=None):
    short_hash = git_remote_short_hash('imptime')
    images_folder = build_folder or get_temp_build_dir("images")
    export_image("imptime/ui-static-assets", image_tag=short_hash, dest_folder=images_folder)

def export_all_api(build_folder=None):
    short_hash = git_remote_short_hash('imptime')
    images_folder = build_folder or get_temp_build_dir("images")
    export_image("imptime/api", image_tag=short_hash, dest_folder=images_folder)

def export_backup_image(build_folder=None):
    short_hash = git_remote_short_hash('imptime')
    images_folder = build_folder or get_temp_build_dir("images")
    export_image("imptime/backup", image_tag=short_hash, dest_folder=images_folder)
    
def export_all_common_lib(build_folder=None):
    short_hash = git_remote_short_hash('imptime')
    short_elk_hash = git_remote_short_hash('imptime')
    images_folder = build_folder or get_temp_build_dir("images")
    export_image("imptime/nginx", image_tag=short_hash, dest_folder=images_folder)
    export_image("imptime/postgresql", image_tag=short_hash, dest_folder=images_folder)


def package_application_docker_compose(output_folder=None):
    """ Create the docker compose file required to start images based on the 
        current branch on the remote repo. And include helper scripts.
        It doesn't attempt to create the images if they don't exist """

    output_folder = output_folder or get_temp_build_dir("docker_compose")
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    original_docker_compose_file = os.path.join(checked_out_code_folder, "deploy", "docker", "docker-compose.yml")
    original_docker_compose_db_file = os.path.join(checked_out_code_folder, "deploy", "docker", "docker-compose.transient-db.yml")
    original_docker_compose_test_file = os.path.join(checked_out_code_folder, "deploy", "docker", "docker-compose-test.yml")
    original_docker_compose_prod_file = os.path.join(checked_out_code_folder, "deploy", "docker", "docker-compose-prod.yml")
    original_docker_compose_monitoring_file = os.path.join(checked_out_code_folder, "deploy", "docker", "docker-compose-monitoring-client.yml")
    #original_docker_compose_elasticsearch_file = os.path.join(checked_out_code_folder, "docker", "docker-compose-elasticsearch.yml")
    #original_docker_compose_logstash_file = os.path.join(checked_out_code_folder, "docker", "docker-compose-logstash.yml")
    #original_docker_compose_kibana_file = os.path.join(checked_out_code_folder, "docker", "docker-compose-kibana.yml")

    output_file_path = package_docker_compose(output_folder,
                                              docker_compose_file_path=original_docker_compose_file,
                                              supplementary_docker_compose_files=[original_docker_compose_db_file,
                                                                                  original_docker_compose_test_file,
                                                                                  original_docker_compose_prod_file,
                                                                                  original_docker_compose_monitoring_file,
                                                                                  #original_docker_compose_elasticsearch_file,
                                                                                  #original_docker_compose_logstash_file,
                                                                                  #original_docker_compose_kibana_file
                                               ])
    
    with lcd(checked_out_code_folder):
        local("cp -R deploy/docker/scripts/client/* {output_folder}".format(output_folder=output_folder))
        
    print("\nSuccess. \nDocker compose file created for branch {branch} at: {output_file_path}"\
          .format(branch=env.branch, output_file_path=output_file_path))
    print("""To confirm deployment, open a new regular terminal in the docker host, then test with:

            $ {output_file_path_on_host}/up_test.sh

           (if you get file not found, make sure you're NOT running this in the same terminal as the deployer)

           Navigate to http://localhost and confirm you can login 
           This setup is NOT for use in production, the database will be lost between restarts.

           To shut it down:

            $ {output_file_path_on_host}/down_test.sh

           When you're configured and ready to go, start it up with: 

            $ {output_file_path_on_host}/up.sh

           And take it down with:

            $ {output_file_path_on_host}/down.sh

           """
          .format(output_file_path_on_host=get_host_path_for_temp_path(output_folder)))
    
    return output_file_path
    
def package_docker_compose(output_folder,
                           docker_compose_file_path,
                           supplementary_docker_compose_files=None,
                           git_hashes=None):
    """ Create the docker compose file required to start images based on the 
        current branch on the remote repo. And include helper scripts.
        It doesn't attempt to create the images if they don't exist """

    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    original_docker_compose_file = docker_compose_file_path

    git_hashes = git_hashes or {}
    git_hashes = { 'api': git_hashes.get('api', None) or git_remote_short_hash('imptime'),
                   'monitoring': git_hashes.get('deploy', None) or  git_remote_short_hash('imptime'),
                   'static_assets': git_hashes.get('static_assets' or None) or git_hashes.get('api' or None) or git_remote_short_hash('imptime') }
    
    with lcd(checked_out_code_folder):
        local("cp -R deploy/docker/scripts/client/* {output_folder}".format(output_folder=output_folder))

    with lcd(output_folder):
        local("mkdir -p imptime-media")
        local("mkdir -p logs")
        
    tokens = { "__TOKEN_IMPTIME_API_SHORT_GIT_HASH__": git_hashes['api'],
               "__TOKEN_IMPTIME_MONITORING_SHORT_GIT_HASH__": git_hashes['monitoring'],
               "__TOKEN_STATIC_ASSETS_HASH__": "STATIC_ASSETS_HASH="+git_hashes['static_assets'],
               "__TOKEN_BUILD_NUMBER__": "BUILD_NUMBER="+env.build_number
               }

    check_local_image_exists("imptime/api", git_hashes['api'])
    check_local_image_exists("imptime/nginx", git_hashes['api'])
    check_local_image_exists("imptime/postgresql", git_hashes['api'])
    check_local_image_exists("imptime/ui", git_hashes['api'])
    check_local_image_exists("imptime/ui-static-assets", git_hashes['api'])
        
    new_docker_compose_file = replace_tokens_in_file(original_docker_compose_file, tokens=tokens)

    new_supplementary_docker_compose_files = []
    for supplementary_docker_compose_file in supplementary_docker_compose_files or []:
        new_supplementary_docker_compose_files.append({'original': supplementary_docker_compose_file,
                                                       'new': replace_tokens_in_file(supplementary_docker_compose_file, tokens=tokens)})
    
    output_file_path = os.path.join(output_folder, "docker-compose.yml")
    with lcd(checked_out_code_folder):
        local("mv {new_docker} {output_file_path}".format(new_docker=new_docker_compose_file,
                                                          output_file_path=output_file_path))

        for supplementary in new_supplementary_docker_compose_files:
            local("mv {new_docker} {output_file_path}"\
                      .format(new_docker=supplementary['new'],
                              output_file_path=os.path.join(output_folder, os.path.basename(supplementary['original']))))

        # Copy the sample external_config so it's easier to get going.
        local("cp -R /opt/imptime/config/sample/* {output_folder}"\
                  .format(branch=env.branch, output_folder=output_folder))

    return output_file_path

def deploy_application(zip_filename):
    start = datetime.datetime.now()
    print("Starting at %s" %start)
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)

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

    stack_number = get_next_stack_number()
    stack_name = "%s%d" % (env.stack_name_prefix, stack_number)
    cloud_formation_template_path=os.path.join(checked_out_code_folder, "deploy", "aws",
                                               "cloud_formation_templates",
                                               "imptime_application_server.cfn.yml")
    ec2_instance_name="Imptime_{instance_name_token}_{target_server}_{server_type}_{stack_number}".format(
        instance_name_token=env.instance_name_token,
        target_server=env.target_server,
        server_type=env.server_type,
        stack_number=stack_number)
    
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
                                       ), capture=True)
        print(stack_create_response)
        time.sleep(2)
        wait_for_stack_create_complete(stack_name)
        server_dns = get_aws_instance_server_data(ec2_instance_name)["PublicDnsName"]
        wait_for_instance_available(ec2_instance_name)

        print("Tailing init scripts for final installation completion")
        tail_deploy(aws_instance_name=ec2_instance_name)
        
        print("Deploy took: %s" % (datetime.datetime.now() - start))

        
        print("Created application server: Instance %s at %s" % (ec2_instance_name, server_dns))
    return ec2_instance_name, stack_name

def bounce(aws_instance_name=None):
    """ takes the server down and then up again """
    aws_instance_data = get_best_application_instance_data(aws_instance_name=aws_instance_name)
    env.host_string = aws_instance_data["PublicDnsName"] # note: because env.hosts can't be changed at this point
    with cd("/opt/imptime/docker_compose"):
        run("./down.sh")
        run("./up.sh")

def up(aws_instance_name=None):
    """ takes the server down and then up again """
    aws_instance_data = get_best_application_instance_data(aws_instance_name=aws_instance_name)
    env.host_string = aws_instance_data["PublicDnsName"] # note: because env.hosts can't be changed at this point
    with cd("/opt/imptime/docker_compose"):
        run("./up.sh")

def down(aws_instance_name=None):
    """ takes the server down and then up again """
    aws_instance_data = get_best_application_instance_data(aws_instance_name=aws_instance_name)
    env.host_string = aws_instance_data["PublicDnsName"] # note: because env.hosts can't be changed at this point
    with cd("/opt/imptime/docker_compose"):
        run("./down.sh")

def down_all_running_instances(confirm_each_server=True):
    stack_names = list_stacks()
    print("Stopping running instances")
    stopped_instances = []
    for stack_name in stack_names:
        instance = get_aws_instance_data_from_stack_name(stack_name)
        print_stack_summary(stack_name)
        if confirm_each_server and not confirm("""Stop this server? """):
            exit()
        aws_instance_name = instance['TagName']
        down(aws_instance_name)
        stopped_instances.append(aws_instance_name)
    print("Stopped %s" % "\n".join(stopped_instances))

def backup(aws_instance_name=None):
    """ runs the backup process now """
    aws_instance_data = get_best_application_instance_data(aws_instance_name=aws_instance_name,
                                                           hint=" [current live server which will run the backup] ")
    env.host_string = aws_instance_data["PublicDnsName"] # note: because env.hosts can't be changed at this point
    with cd("/opt/imptime/docker_compose"):
        run("./force_backup.sh")

def rollback(aws_proxy_instance_name=None):
    """ run using 'fab host_production rollback' """
    
    current_aws_stack_name = get_best_guess_active_stack_name()
    previous_aws_stack_name = get_sorted_active_stack_names()[1]

    if not confirm("This rollback function will not restore the database, so it's only suitable for certain types of rollback"):
        exit()
    
    
    print("This is the current stack:")
    print_stack_summary(current_aws_stack_name)
    print("\nThis is the previous stack:")
    print_stack_summary(previous_aws_stack_name)
    if not confirm("Please confirm you want to disable " + current_aws_stack_name + " and enable " + previous_aws_stack_name):
        exit()

    print("Confirming appropriate proxy")
    if aws_proxy_instance_name is None:
        aws_proxy_stack_name = confirm_best_guess_active_stack_name(
            stack_name_prefix=env.proxy_stack_name_prefix, hint="proxy")
        aws_proxy_instance_name = get_instance_name_from_stack_name(aws_proxy_stack_name)
        
    maintenance_on(aws_proxy_instance_name=aws_proxy_instance_name,
                    ip_whitelist=get_public_ip())

    current_aws_instance_name = get_instance_name_from_stack_name(current_aws_stack_name)
    previous_aws_instance_name = get_instance_name_from_stack_name(previous_aws_stack_name)
    previous_aws_instance_data = get_aws_instance_data_from_stack_name(previous_aws_stack_name)
    
    print("Taking current stack down:")
    down(current_aws_instance_name)
    print("Taking previous stack up:")
    up(previous_aws_instance_name)

    print("Updating proxy dns")
    update_proxy_destination(destination_dns=previous_aws_instance_data['PrivateDnsName'],
                             dns_subdomain=env.dns_subdomain,
                             aws_proxy_instance_name=aws_proxy_instance_name)

    print("Deleting the old stack")
    delete_stack(current_aws_stack_name, confirm_deletion=True)

    maintenance_off(aws_proxy_instance_name=aws_proxy_instance_name)

    print("Old stack restored")
