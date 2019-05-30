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

from fabfilelib_aws import *

from fabfilelib_general import *
from fabfilelib_proxy import *
from fabfilelib_aws import *
from fabfilelib_rds import *
from fabfilelib_monitoring import *
from fabfilelib_application import *
from fabfilelib_docker import *
from fabfilelib_git import *

def build_all_dev_images():
    """ Builds everything needed for developers, including everything in 'build_all_images'. """
    build_args = {'nginx_docker_tokens':
                  {'# __token_imptime_dev_conf__' :
                   'RUN ln -s /etc/nginx/sites-available/imptime_localhost.conf /etc/nginx/sites-enabled/imptime_localhost.conf'}}
    build_all_images(build_args=build_args)
    build_dev_react_compiler_image()
    print("Success: All dev images created")

def build_dev_react_compiler_image():
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    short_hash = git_local_short_hash(checked_out_code_folder)
    build_folder = get_temp_build_dir(git_repo)
    docker_file = get_cache_corrected_docker_file(os.path.join(checked_out_code_folder,
                                                               "docker",
                                                               "Dockerfile-imptime-dev-ui-react-and-css-builder"),
                                                  output_folder=build_folder)
    build_from_dockerfile(build_folder,
                          docker_file,
                          image_name="imptime/dev-ui-react-and-css-builder",
                          tag_name=short_hash)


def dev_on(host_api_folder=None):
    """ Configures the build to use your local code folders so you can edit and run code live. It includes
        everything required to auto-compile your code where required (eg javascript). """

    if host_api_folder is None:
        host_api_folder = os.path.abspath(os.path.join(env.guessed_dev_code_root_folder))

        print("""You haven't specified where your local copy of imptime is.""")
        print("""Our guess is they are here:\n
                 {host_api_folder}\n
                 """.format(host_api_folder=host_api_folder))
        if not confirm("Is this correct? "):
            print("Aborting")
            print("""Please run this command using the format:\n
                     fab host_local dev_on:<path/to/your/checked_out/imptime>
            """)
            return

    codes_mounted = []
    output_folder = get_temp_build_dir("dev_on")
    git_repo = "imptime"
    checked_out_code_folder = git_checkout(git_repo)
    original_docker_compose_file = os.path.join(checked_out_code_folder, "deploy", "docker", "docker-compose.yml")
    original_docker_compose_db_file = os.path.join(checked_out_code_folder, "deploy", "docker", "docker-compose-dev.transient-db.yml")
    original_docker_compose_dev_file = os.path.join(checked_out_code_folder, "deploy", "docker", "docker-compose-dev.yml")

    dev_docker_compose_file = os.path.join(output_folder, "docker-compose.yml")
    dev_docker_compose_dev_file = os.path.join(output_folder, "docker-compose-dev.yml")
    dev_docker_compose_db_file = original_docker_compose_db_file

    yaml_dc = yaml.load(open(original_docker_compose_file))
    dev_yaml_dc = yaml.load(open(original_docker_compose_dev_file))

    src_folders_to_mount = [ "./temp:/opt/imptime/temp",
                             "./imptime-media:/opt/imptime/media/",
                             "./logs:/opt/imptime/logs/",
                             "%s:%s" % (os.path.join(host_api_folder, "../src/api"), "/opt/imptime/api/api"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/devops"), "/opt/imptime/api/devops"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/django_remote_forms"), "/opt/imptime/api/django_remote_forms"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/imptime"), "/opt/imptime/api/imptime"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/impasync"), "/opt/imptime/api/impasync"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/lib"), "/opt/imptime/api/lib"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/django_traffic"), "/opt/imptime/api/django_traffic"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/invoicing"), "/opt/imptime/api/invoicing"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/timepiece"), "/opt/imptime/api/timepiece"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/implicitdesign"), "/opt/imptime/api/implicitdesign"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/mailqueue"), "/opt/imptime/api/mailqueue"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/paranoidsessions"), "/opt/imptime/api/paranoidsessions"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/test_helper"), "/opt/imptime/api/test_helper"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/testable"), "/opt/imptime/api/testable"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/user_management"), "/opt/imptime/api/user_management"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/imp_wiki"), "/opt/imptime/api/imp_wiki"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/emacs_importer"), "/opt/imptime/api/emacs_importer"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/puppeteer"), "/opt/imptime/api/puppeteer"),
                             "%s:%s" % (os.path.join(host_api_folder, "../src/jira_interface"), "/opt/imptime/api/jira_interface")
    ]

    if host_api_folder:
        images = { 'migrate-api-database' : { 'entry_point': './migrate-api-database.sh' },
                   'api' : { 'entry_point': './start-dev-api.sh' } }

        for image_name, image_props in images.items():
            yaml_dc['services'][image_name]['volumes'] = src_folders_to_mount


            yaml_dc['services'][image_name]['entrypoint'] = image_props['entry_point']
            codes_mounted.append("api %s : %s" % (image_name, host_api_folder))

        ui_volumes = [x.replace("src/api", "src/ui") for x in src_folders_to_mount]

        images = { 'deploy-ui-static-assets' : { 'entry_point': './deploy-static-assets.sh' },
                   'ui-worker1' : { 'entry_point': './start-ui-worker.sh' },
                   'ui-worker2' : { 'entry_point': './start-ui-worker.sh' },
                   'ui-worker3' : { 'entry_point': './start-ui-worker.sh' },
                   'ui-worker4' : { 'entry_point': './start-ui-worker.sh' },
                   'ui-refresh-listener' : { 'entry_point': './start-ui-refresh-listener.sh' } }

        for image_name, image_props in images.items():
            yaml_dc['services'][image_name]['volumes'] = list(ui_volumes)
            yaml_dc['services'][image_name]['entrypoint'] = image_props['entry_point']

        codes_mounted.append("api %s : %s" % (image_name, host_api_folder))

        yaml_dc['services']['nginx']['volumes'] = \
                                                  ["%s:/opt/imptime/static_collected/dev" % (os.path.join(host_api_folder, "static_collected")),
                                                   "./external_config/:/opt/imptime/external_config/"]
        codes_mounted.append("nginx")

        dev_yaml_dc['services']['dev-ui-react-and-css-builder']['volumes'] = \
                                                                             ui_volumes + \
                                                                             [ "%s:%s" % (os.path.join(host_api_folder, "../mobile"), "/opt/imptime/ui/mobile"),
                                                                               "%s:%s" % (os.path.join(host_api_folder, "../reimp"), "/opt/imptime/ui/reimp"),
                                                                               "%s:/opt/imptime/ui/static_collected" % (os.path.join(host_api_folder, "static_collected")) ]

        codes_mounted.append("dev-ui-react-and-css-builder")

    yaml_dump(yaml_dc, dev_docker_compose_file)
    yaml_dump(dev_yaml_dc, dev_docker_compose_dev_file)

    git_hashes = {'api': get_most_recent_image_tag('api'),
                  'ui': get_most_recent_image_tag('ui'),
                  'static_assets': 'dev'}

    check_local_image_exists("imptime/dev-ui-react-and-css-builder", git_hashes['ui'])

    output_file_path = package_docker_compose(output_folder=output_folder,
                                              docker_compose_file_path=dev_docker_compose_file,
                                              supplementary_docker_compose_files=[dev_docker_compose_db_file,
                                                                                  dev_docker_compose_dev_file],
                                              git_hashes=git_hashes)

    with lcd(checked_out_code_folder):
        local("cp -R deploy/docker/scripts/dev/* {output_folder}".format(output_folder=output_folder))

    local("chmod -R 777 " + output_folder) # for convenience of editing

    print("Developer docker compose file created for branch {branch} at: {output_file_path}"\
          .format(branch=env.branch, output_file_path=output_file_path))
    print("\nThe following volumes have been mounted: \n%s" % "\n   ".join(codes_mounted))
    print("""\n\n-------------------------------------------------\n

           To run in dev mode, open a new regular terminal in the docker host, then test with:

            $ {output_file_path_on_host}/up_dev.sh

           To shut it down:

            $ {output_file_path_on_host}/down_dev.sh


           -------------------------------------------------------

           """
          .format(output_file_path_on_host=get_host_path_for_temp_path(output_folder)))

def fab_import_db(db_file_path=None):
    if db_file_path is None:
        print("Put the db file to import at %s and pass in the filename" % get_host_path_for_temp_path())
        return

    local("docker exec -it   --no-trunc --format '{{.ID}} {{.CreatedSince}}' | grep ' months' | awk '{ print $1 }' | xargs --no-run-if-empty docker rmi -f")
