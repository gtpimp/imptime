from fabric.api import local, settings, abort, run, cd, env, prefix
from fabric.operations import get
import os, errno
import shutil
from fabric.contrib.console import confirm, prompt
import datetime

local_code_dir = os.path.dirname(os.path.realpath(__file__))
imp_remote_code_dir = "/home/timesheet"
imp_remote_scripts_dir = "/home/timesheet/scripts"
imp_remote_venv_dir = imp_remote_code_dir + "/venv"
imp_remote_managepy_dir = imp_remote_code_dir + "/src"
imp_remote_venv_command = "source %s/bin/activate" % imp_remote_venv_dir
imp_remote_media_dir = imp_remote_code_dir + "/media"

# ===== Usage =====

usage = """

To deploy live to implicitdesign.co.za
--------------------------------------

  > fab host_imp deploy_prod

To re-import timesheets on implicitdesign.co.za
--------------------------------------------
  
  > fab host_imp import_timesheet

"""
def help():
    print usage

# ===== hosts =====
def host_imp():
    env.user = "gtp"
    env.hosts = ['timesheet.implicitdesign.co.za']

# ===== top level commands ======

def deploy_prod():
    branch = prompt("Which branch?")
    with cd(imp_remote_code_dir):
        run("./deploy_production.sh %s" % branch)

def import_timesheet(users=''):
    with cd(imp_remote_scripts_dir):
        run("./import_timesheets.sh")
