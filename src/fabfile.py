from fabric.api import local, settings, abort, run, cd, env, prefix
from fabric.operations import get
import os, errno
import shutil
from fabric.contrib.console import confirm
import datetime

local_code_dir = os.path.dirname(os.path.realpath(__file__))
imp_remote_code_dir = "/home/website"
imp_remote_venv_dir = imp_remote_code_dir + "/impwebsite/venv"
imp_remote_managepy_dir = imp_remote_code_dir + "/impwebsite/src"
imp_remote_venv_command = "source %s/bin/activate" % imp_remote_venv_dir
imp_remote_media_dir = imp_remote_code_dir + "/impwebsite/media"

# ===== Usage =====

usage = """

To deploy staging on implicitdesign.co.za
-----------------------------------------

  > fab host_imp deploy_prod

To import timesheets on implicitdesign.co.za
--------------------------------------------
  
  > fab host_imp import_timesheet

To view staff daylies
---------------------

  > fab host_imp daylies

"""
def help():
    print usage

# ===== hosts =====
def host_imp():
    env.user = "gtp"
    env.hosts = ['implicit.implicitdesign.co.za']

# ===== top level commands ======

def deploy_prod():
    with cd(imp_remote_code_dir):
        run("./deploy_production.sh")

def import_timesheet(users=''):
    with cd(imp_remote_managepy_dir):
        with prefix(imp_remote_venv_command):
            run("python manage.py import_timesheet %s" % users)
            
            local_download_path = os.path.join(local_code_dir,"..", "temp/unknown_redmine_entries")
            
            try:
                os.makedirs(local_download_path)
            except OSError as exc:
                if exc.errno == errno.EEXIST:
                    pass
                else: 
                    raise

            for root, dirs, files in os.walk(local_download_path):
                for f in files:
                    os.unlink(os.path.join(root, f))
                for d in dirs:
                    shutil.rmtree(os.path.join(root, d))
            
            get(imp_remote_media_dir+"/unknown_redmine_entries/*", local_download_path)
            print("Downloaded unknown entries to : %s" % local_download_path)

def daylies():
    with cd(imp_remote_managepy_dir):
        with prefix(imp_remote_venv_command):
            run("python manage.py daylies")

