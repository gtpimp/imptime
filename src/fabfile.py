from fabric.api import local, settings, abort, run, cd, env
import os
from fabric.contrib.console import confirm
import datetime

local_code_dir = os.path.dirname(os.path.realpath(__file__))
imp_remote_code_dir = "/home/website"

# ===== Usage =====

usage = """

To deploy staging on implicitdesign.co.za
-----------------------------------------

  > fab host_imp deploy_prod

"""
def help():
    print usage

# ===== hosts =====
def host_imp():
    env.user = "website"
    env.hosts = ['implicitdesign.co.za']

# ===== top level commands ======

def deploy_prod():
    with cd(imp_remote_code_dir):
        run("./deploy_production.sh")

