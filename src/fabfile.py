from fabric.api import local, settings, abort, run, cd, env, prefix
from fabric.operations import get
import os, errno
import shutil
from fabric.contrib.console import confirm, prompt
import datetime

local_code_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)))
imp_remote_code_dir = "/home/timesheet"
imp_remote_scripts_dir = "/home/timesheet/scripts"
imp_remote_venv_dir = imp_remote_code_dir + "/venv"
imp_remote_managepy_dir = imp_remote_code_dir + "/src"
imp_remote_venv_command = "source %s/bin/activate" % imp_remote_venv_dir
imp_remote_media_dir = imp_remote_code_dir + "/media"

sass_remote_code_dir = "/home/imptime"
sass_remote_scripts_dir = "/home/imptime/scripts"
sass_remote_venv_dir = sass_remote_code_dir + "/venv"
sass_remote_managepy_dir = sass_remote_code_dir + "/src"
sass_remote_venv_command = "source %s/bin/activate" % sass_remote_venv_dir
sass_remote_media_dir = sass_remote_code_dir + "/media"

# ===== Usage =====

usage = """

To deploy live to implicitdesign.co.za
--------------------------------------

  > fab host_impd deploy:<branch>

To deploy software as a service to imptime.co.za
--------------------------------------

  > fab host_sass deploy_sass:<branch>

To deploy to staging on dev.implicitdesign.co.za
------------------------------------------------

  > fab staging deploy_staging:origin,branch

To re-import timesheets on implicitdesign.co.za
-----------------------------------------------

  > fab host_impd import_timesheet

"""


def help():
    print usage


def host_impd():
    env.user = "gtp"
    env.hosts = ['timesheet.implicitdesign.co.za']


def staging():
    env.user = "impd"
    env.hosts = ['impd@dev.implicitdesign.co.za']
    env.base_dir = '/home/imptime/'


def host_sass():
    env.user = "impd"
    env.hosts = ["cognitivesystems.imptime.co.za"]

# ===== top level commands ======


def deploy(branch="prod"):
    with cd(imp_remote_code_dir):
        run("./deploy_production.sh %s" % branch)


def deploy_sass(branch="prod"):
    with cd(sass_remote_code_dir):
        run("./deploy_production.sh %s" % branch)


def import_timesheet(users=''):
    with cd(imp_remote_scripts_dir):
        run("./import_timesheets.sh")


def deploy_staging(git_origin, branch):
    print("Deploying: ** %s ** to staging server: %s" % (branch, env.hosts[0]))

    with cd(local_code_dir):
        current_branch = local('git describe --contains --all HEAD',
                               capture=True)
        if current_branch != branch:
            print 'Branch %s is not currently checked out' % branch
            return
        local('git push origin %s' % branch)

    print 'Deploying - ', env.base_dir
    release(env.base_dir, git_origin, branch)
    with cd(env.base_dir):
        print('Reloading apache2 config')
        run('sudo service apache2 reload')


def release(dirpath, git_origin, branch):
    with cd(dirpath):
        run('git reset --hard HEAD')
        run('git fetch %s' % git_origin)
        run('git checkout %s' % branch)
        run('git pull %s %s' % (git_origin, branch))
        run('scripts/deploy_local.sh')
