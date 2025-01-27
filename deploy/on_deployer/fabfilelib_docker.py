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

from fabfilelib_aws import *

def clean_dangling_images():
    """ remove dangling images from the docker host, safe to run but not enough if you want a full cleanout """
    with settings(warn_only=True):
        local('docker rmi -f $(docker images -f "dangling=true" -q)')

def clean_all_images():
    with settings(warn_only=True):
        local("docker images --no-trunc --format '{{.ID}} {{.CreatedSince}}' | awk '{ print $1 }' | xargs --no-run-if-empty docker rmi -f")
        
def clean_old_images():
    """ remove all/most images older than 2 weeks old. Warning: You could lose images you want, ensure you can re-create them. """
    clean_dangling_images()

    with settings(warn_only=True):
        local("docker images --no-trunc --format '{{.ID}} {{.CreatedSince}}' | grep ' months' | awk '{ print $1 }' | xargs --no-run-if-empty docker rmi -f")
        local("docker images --no-trunc --format '{{.ID}} {{.CreatedSince}}' | grep ' 2 weeks' | awk '{ print $1 }' | xargs --no-run-if-empty docker rmi -f")
        local("docker images --no-trunc --format '{{.ID}} {{.CreatedSince}}' | grep ' 3 weeks' | awk '{ print $1 }' | xargs --no-run-if-empty docker rmi -f")
        local("docker images --no-trunc --format '{{.ID}} {{.CreatedSince}}' | grep ' 4 weeks' | awk '{ print $1 }' | xargs --no-run-if-empty docker rmi -f")
        local("docker images --no-trunc --format '{{.ID}} {{.CreatedSince}}' | grep ' 5 weeks' | awk '{ print $1 }' | xargs --no-run-if-empty docker rmi -f")

def get_cache_corrected_docker_file(docker_file_path, output_folder=None, pip_requirements_file=None, docker_tokens=None):
    if output_folder:
        output_file_path = os.path.join(output_folder, "docker_cache_corrected")
    else:
        output_file_path = docker_file_path + "_cache_corrected"

    pip_requirements_token_replacements = None
    if pip_requirements_file is not None:
        pip_requirements_token_replacements = []
        with open(pip_requirements_file) as pip_in:
            for pip_program in pip_in:
                if len(pip_program.strip()) > 0:
                    pip_requirements_token_replacements.append("RUN pip install {pip_program}"\
                                                               .format(pip_program=pip_program))
        
    with open(docker_file_path) as fin:
        with open(output_file_path, "w") as fout:
            for line in fin:
                line = line.replace("# _token__no_cache_from_here", "RUN _THROWAWAY_FORCE_CACHE_RESET_='%s'" % str(datetime.datetime.now()))
                if pip_requirements_token_replacements:
                    pass
                    ##  Don't unpack the pip install line, because the dependancies get messed up
                    # token = "RUN pip install -r requirements.txt"
                    # line = line.replace(token, "\n".join(pip_requirements_token_replacements + [token]))

                if docker_tokens:
                    for before, after in docker_tokens.items():
                        line = line.replace(before, after)
                    
                fout.write(line)
    return output_file_path

def export_image(image_name, image_tag, dest_folder):
    if image_tag:
        image_tag = ":" + image_tag
    else:
        image_tag = ""
    image_filename = "%s.image" % image_name.replace("/", "-")
    image_filepath = os.path.join(dest_folder, image_filename)
    with lcd(dest_folder):
        local("docker save -o {image_filepath} {image_name}{image_tag}"\
              .format(dest_folder=dest_folder,
                      image_name=image_name,
                      image_filepath=image_filepath,
                      image_tag=image_tag))

def package_images(build_folder, name_prefix="latest",
                    upload=False, extra_folders = None, source_folder='images'):
    extra_folders = extra_folders or []
    zip_name = "imptime_%s_%s.zip" % (name_prefix, env.build_number)
    zip_path = os.path.join(build_folder, zip_name)
    with lcd(build_folder):
        local("rm -f {zip_name}".format(zip_name=zip_name))
        local("zip -r {zip_name} {source_folder} {extra_folders}"\
              .format(zip_name=zip_name,
                      source_folder=source_folder,
                      extra_folders=" ".join(extra_folders)))
        packaged_file_path = zip_path
            
    print("Zip created at {packaged_file_path}".format(packaged_file_path=packaged_file_path))
    if upload:
        upload_to_s3(packaged_file_path, bucket_name=env.s3_bucket_name_releases)
        
    return packaged_file_path

def build_from_dockerfile(working_folder, docker_file, image_name, tag_name):
    with lcd(working_folder):
        local("DOCKER_BUILDKIT=0 docker build -f {docker_file} -t {image_name}:{tag_name} ."\
              .format(docker_file=docker_file,
                      image_name=image_name,
                      tag_name=tag_name))
    print("Created docker image: {image_name}:{tag_name}"\
          .format(image_name=image_name, tag_name=tag_name))


def check_local_image_exists(image_name, image_tag=None):
    print "Disabled, takes too long and we don't care"
    return True

    # with settings(warn_only=True):
    #     res = local("docker images | grep {image_name}"\
    #                 .format(image_name=image_name), capture=True).stdout

    # if image_tag:
    #     exists = image_tag in res
    #     image_tag = "(any image)"
    # else:
    #     exists = len(res.strip())>0
    # if not exists:
    #     print("********* Warning: You don't have {image_name}:{image_tag} in your local repository ****** "\
    #               .format(image_name=image_name, image_tag=image_tag))
    #     print("You can build all images using: fab host_local build_all_images")
    #     print("OR for dev mode, use:           fab host_local build_all_dev_images")
    # else:
    #     print("Ok, image exists")
    # return exists
        
def get_running_container_id_for_image(container_name):
    return local("docker ps | grep {container_name} | awk '{{print $1;}}'".format(container_name=container_name),
                 capture=True).stdout

def get_most_recent_image_tag(image_name):
    return local("docker images | grep 'imptime/{image_name} ' | head -n 1 | awk '{{print $2;}}'"\
                 .format(image_name=image_name), capture=True).stdout

    


