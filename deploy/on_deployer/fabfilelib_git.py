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

git_hash_cache = {}

def git_checkout(git_repo):
    global git_hash_cache    
    checked_out_code_folder = os.path.join(env.mapped_temp_dir, git_repo)
    local("mkdir -p {checked_out_code_folder}".format(checked_out_code_folder=checked_out_code_folder))
    if not os.path.exists(os.path.join(checked_out_code_folder, ".git")):
        with lcd(os.path.join(env.mapped_temp_dir)):
             local("git clone --depth 1 -b {branch} {git_url}:{git_repo_prefix}{git_repo}"\
                   .format(branch=env.branch, #***
                           git_url=env.git_url,
                           git_repo_prefix=env.git_repo_prefix,
                           git_repo=git_repo))
    with lcd(checked_out_code_folder):
        local("git fetch origin")
        local("git checkout origin/{branch}".format(branch=env.branch)) #***
        local("git reset --hard HEAD")
        local("git pull origin {branch}".format(branch=env.branch)) #***

        if git_repo in git_hash_cache.keys():
            local("git reset --hard %s" % git_hash_cache[git_repo])
        else:
            git_local_short_hash(checked_out_code_folder)

    short_hash = git_local_short_hash(checked_out_code_folder)
    with open(os.path.join(checked_out_code_folder, "version.txt"), "w") as f:
        f.write(short_hash)
        
    return checked_out_code_folder

def git_local_short_hash(checked_out_code_folder):
    global git_hash_cache
    if checked_out_code_folder not in git_hash_cache.keys():
        with lcd(checked_out_code_folder):
            long_local_hash = local("git rev-parse HEAD", capture=True).stdout
            git_hash_cache[checked_out_code_folder] = convert_long_hash_to_short_hash(long_local_hash)
    return git_hash_cache[checked_out_code_folder]

def git_remote_short_hash(git_repo):
    global git_hash_cache
    if git_repo not in git_hash_cache.keys():
        long_remote_hash = local('git ls-remote {git_url}:{git_repo_prefix}{git_repo} refs/heads/{branch} | grep -v "original"'\
                                 .format(git_url=env.git_url,
                                         git_repo=git_repo,
                                         git_repo_prefix=env.git_repo_prefix,
                                         branch=env.branch),  #***
                                 capture=True).stdout
        git_hash_cache[git_repo] = convert_long_hash_to_short_hash(long_remote_hash)
    return git_hash_cache[git_repo]

def convert_long_hash_to_short_hash(long_hash):
    return long_hash[:7]

