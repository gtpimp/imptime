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

def get_temp_build_dir(build_name):
    build_folder = os.path.join(env.mapped_temp_dir, build_name)
    with lcd(env.mapped_temp_dir):
        local("mkdir -p " + build_folder)
    local("chown `whoami` -R " + env.mapped_temp_dir)
    return build_folder

def replace_tokens_in_file(file_path, tokens):
    output_file_path = file_path + "_replaced"
    with open(file_path) as fin:
        with open(output_file_path, "w") as fout:
            for line in fin:
                for k,v in tokens.items():
                    line = line.replace(k, v)
                fout.write(line)
    return output_file_path

def get_host_path_for_temp_path(file_path):
    return file_path.replace(env.mapped_temp_dir, env.mapped_temp_dir_on_host)

def yaml_dump(yaml_dict, output_filepath):
    noalias_dumper = yaml.dumper.SafeDumper
    noalias_dumper.ignore_aliases = lambda self, data: True
    yaml.dump(yaml_dict, open(output_filepath, "w"), default_flow_style=False, Dumper=noalias_dumper)

def get_external_config_temp_folder():
    return "%s_%s_external_config" % (env.target_server, env.server_type)

        
    
