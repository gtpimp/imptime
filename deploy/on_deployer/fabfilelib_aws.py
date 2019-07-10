from fabric.api import local, settings, abort, run, cd, env, sudo, lcd
from dockerfabric.apiclient import docker_fabric as dfab
import requests
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
from fabric.exceptions import NetworkError

from fabfilelib_general import *

def get_aws_instance_data_from_stack_name(stack_name):
    aws_response = local(("aws ec2 describe-instances " +
                              "--profile {aws_profile_name} " +
                              "--region {aws_region} " +
                              "--filters Name=tag:aws:cloudformation:stack-name,Values=\"{stack_name}\"").format(
                                  aws_profile_name=env.aws_deploy_profile_name,
                                  aws_region=env.aws_region,
                                  stack_name=stack_name), capture=True)
    instance_data = json.loads(aws_response)
    instance = instance_data["Reservations"][0]["Instances"][0]

    for tag in instance["Tags"]:
        instance["Tag"+tag["Key"]] = tag["Value"]
    
    return instance
    
def get_aws_instance_server_data(ec2_instance_name):
    """ 
    Some useful variables returned are:
     -  PublicDnsName
     -  PublicIpAddress
     -  PrivateDnsName
     -  PrivateIpAddress
    """    
    aws_response = local(("aws ec2 describe-instances " +
                              "--profile {aws_profile_name} " +
                              "--region {aws_region} " +
                              "--filters Name=tag:Name,Values=\"{ec2_instance_name}\"").format(
                                  aws_profile_name=env.aws_deploy_profile_name,
                                  aws_region=env.aws_region,
                                  ec2_instance_name=ec2_instance_name), capture=True)
    instance_data = json.loads(aws_response)
    if len(instance_data["Reservations"]) == 0 or len(instance_data["Reservations"][0]["Instances"]) == 0:
        print("No instance server data found for %s" % ec2_instance_name)
        return None
    return instance_data["Reservations"][0]["Instances"][0]

def wait_for_stack_create_complete(stack_name):
    pending_status = "CREATE_IN_PROGRESS"
    current_status = pending_status
    while current_status == pending_status:
        time.sleep(10)
        aws_response = local(("aws cloudformation describe-stacks " +
                              "--profile {aws_profile_name} " +
                              "--region {aws_region} " +
                              "--stack-name {stack_name}").format(
                                  aws_profile_name=env.aws_deploy_profile_name,
                                  aws_region=env.aws_region,
                                  stack_name=stack_name), capture=True)
        stack_data = json.loads(aws_response)
        if len(stack_data['Stacks']) == 0:
            print("No stack found called %s, trying again" % stack_name)
        else:
            current_status = stack_data['Stacks'][0]['StackStatus']
            print("Status of stack %s is %s" % (stack_name, current_status))
    print("Leaving loop, stack is in %s" % current_status)

def set_aws_dns_entry(destination_ip, dns_subdomain, subsubdomains, dns_domain=None):
    """ Updates dns_subdomain to point to destination_ip """
    if isinstance(subsubdomains, str):
        subsubdomains = subsubdomains.split(",")
    dns_domain = dns_domain or env.dns_domain
    zone_id = get_aws_dns_zone_id(dns_domain=dns_domain)

    if len(dns_subdomain)>0:
        dns_subdomain = dns_subdomain + "."

    changes = []
    for subsubdomain in subsubdomains:

        if len(subsubdomain) > 0:
            domain = "%s.%s%s." % (subsubdomain, dns_subdomain, dns_domain)
        else:
            domain = "%s%s." % (dns_subdomain, dns_domain)
        
        changes.append({
            "Action": "UPSERT",
            "ResourceRecordSet": {
                "Name": domain,
                "Type": "A",
                "TTL": 1,
                "ResourceRecords": [
                    {
                        "Value": destination_ip
                    }
                ]
            }
        })
    
    cmd = { "Comment": "Setting {dns_subdomain}.{dns_domain} to point to {destination_ip}"\
            .format(dns_subdomain=dns_subdomain,
                    dns_domain=env.dns_domain,
                    destination_ip=destination_ip),
            "Changes": changes }

    temp_folder = get_temp_build_dir("dns")
    temp_filename = "dns_cmd.json"
    with open(os.path.join(temp_folder, temp_filename), "w") as f:
        f.write(json.dumps(cmd))
    print cmd

    local(("aws route53 change-resource-record-sets " +
           "--profile {aws_profile_name} " +
           "--region {aws_region} " +
           "--hosted-zone-id {zone_id} " +
           "--change-batch file://{cmd}").format(
               aws_profile_name=env.aws_deploy_profile_name,
               aws_region=env.aws_region,
               zone_id=zone_id,
               cmd=os.path.join(temp_folder, temp_filename)
           ))
    
def get_aws_dns_zone_id(dns_domain=None):
    dns_domain = dns_domain or env.dns_domain
    aws_zone_response = local(("aws route53 list-hosted-zones " +
                               "--profile {aws_profile_name} " +
                               "--region {aws_region} " +
                               "--query \"HostedZones[?Name == '{dns_domain}.']\"").format(
                                   aws_profile_name=env.aws_deploy_profile_name,
                                   aws_region=env.aws_region,
                                   dns_domain=dns_domain), capture=True)
    zone_data = json.loads(aws_zone_response)
    zone_id = zone_data[0]['Id']
    return zone_id

def get_instance_name_from_stack_name(stack_name):
    instance_data = get_aws_instance_data_from_stack_name(stack_name)
    return instance_data['TagName']

def get_best_application_instance_data(aws_instance_name=None, hint=None):
    if aws_instance_name is None:
        aws_stack_name = confirm_best_guess_active_stack_name(hint=hint)
        if aws_stack_name is None:
            print("No active stack found")
            return
        else:
            print("Assuming active server stack name is %s" % aws_stack_name)
        aws_instance_data = get_aws_instance_data_from_stack_name(aws_stack_name)
    else:
        aws_instance_data = get_aws_instance_server_data(aws_instance_name)
    return aws_instance_data

def upload_to_s3(filepath, bucket_name):
    filename = os.path.basename(filepath)
    dest_path="s3://{bucket_name}/{filename}".format(bucket_name=bucket_name, filename=filename)
    print("Uploading %s to %s" % (filepath, dest_path))
    local("aws s3 cp --profile={s3_aws_profile} --region {aws_region} {filepath} {dest_path}"\
          .format(filepath=filepath,
                  dest_path=dest_path,
                  aws_region=env.aws_region,
                  s3_aws_profile=env.s3_aws_profile))

def download_from_s3(filename, bucket_name, local_folder):
    aws_path="s3://{bucket_name}/{filename}".format(bucket_name=bucket_name, filename=filename)
    print("Downloading %s to %s" % (aws_path, local_folder))
    local("aws s3 cp --profile={s3_aws_profile} --region {aws_region} {aws_path} {local_folder}"\
          .format(aws_path=aws_path,
                  local_folder=local_folder,
                  aws_region=env.aws_region,
                  s3_aws_profile=env.s3_aws_profile))

def print_instance_info():
    """ prints the dns name for the most likely server instance for the host configuration """
    print get_best_application_instance_data()["PublicDnsName"]
        
def get_instance_dns_name(aws_instance_name=None):
    aws_instance_data = get_best_application_instance_data(aws_instance_name=aws_instance_name)
    print aws_instance_data["PublicDnsName"]

def get_instance_data(aws_instance_name=None):
    aws_instance_data = get_best_application_instance_data(aws_instance_name=aws_instance_name)
    print aws_instance_data

def list_stacks():
    stack_name_pattern = env.stack_name_prefix + "(\d+)"
    stack_names = [stack_name for stack_name in get_stack_names() if re.search(stack_name_pattern, stack_name) is not None]
    print stack_names
    return stack_names

def get_stack_data():
    aws_response = local("aws cloudformation describe-stacks --profile {aws_profile_name} --region {aws_region}".format(
        aws_profile_name=env.aws_deploy_profile_name,
        aws_region=env.aws_region), capture=True)
    stack_data = json.loads(aws_response)
    return stack_data['Stacks']
    
def get_stack_names():
    stack_names = [ stack['StackName'] for stack in get_stack_data() ]
    return stack_names

def get_next_stack_number():
    stack_name_pattern = env.stack_name_prefix + "(\d+)"
    max_stack_number = 0
    for stack_name in get_stack_names():
        m = re.search(stack_name_pattern, stack_name)
        if m is not None:
            stack_number = int(m.groups(0)[0])
            max_stack_number = max(stack_number, max_stack_number)
    return max_stack_number+1

def delete_old_stacks(exclude_stack_names):
    exclude_stack_names = exclude_stack_names or ""
    if isinstance(exclude_stack_names, str):
        exclude_stack_names = exclude_stack_names.split("|")
    if len(exclude_stack_names) == 0:
        print("Failed: You must keep at least one stack alive")
        exit(1)
    for stack_name in list_stacks():
        if stack_name not in exclude_stack_names:
            print("Deleting stack %s" % stack_name)
            delete_stack(stack_name, confirm_deletion=False)

def delete_stack(stack_name, confirm_deletion=True):
    if confirm_deletion and not confirm("Are you sure you want to delete the stack with name %s?" % stack_name):
        return

    if stack_name not in list_stacks():
        print("Stack name not found in allowed stack names")
        return
    
    local(("aws cloudformation delete-stack " +
           "--profile {aws_profile_name} " +
           "--region {aws_region} " +
           "--stack-name {stack_name}").format(
               aws_profile_name=env.aws_deploy_profile_name,
               aws_region=env.aws_region,
               stack_name=stack_name))
    print("Delete stack triggered for %s" % stack_name)

def print_stack_summary(stack_name):
    instance_data = get_aws_instance_data_from_stack_name(stack_name)
    print("""--- Stack {stack_name}  ---
 
                      Instance name {instance_name}
                      Created at {launch_time}
                      Public DNS is {public_dns}
                      Private DNS is {private_dns}
                      Public IP is {public_ip}
                      Status is {status}

             Likely ssh command is:
               ssh -i "~/.ssh/{key_name}.pem" ubuntu@{public_dns} """\
          .format(stack_name=stack_name,
                  instance_name=instance_data['TagName'],
                  launch_time=instance_data['LaunchTime'],
                  public_dns=instance_data['PublicDnsName'],
                  private_dns=instance_data['PrivateDnsName'],
                  public_ip=instance_data['PublicIpAddress'],
                  status=instance_data['State']['Name'],
                  key_name=instance_data['KeyName']))

def guess():
    """ for printing purposes """
    best_stack_name = get_best_guess_active_stack_name()
    print_stack_summary(best_stack_name)

def confirm_best_guess_active_stack_name(stack_name_prefix=None, hint=None):
    best_stack_name = get_best_guess_active_stack_name(stack_name_prefix=stack_name_prefix)
    print_stack_summary(best_stack_name)
    if not confirm("""Is this the {hint} server you're looking for? """.format(hint=hint or "")):
        exit()
    return best_stack_name

def get_sorted_active_stack_names(stack_name_prefix=None):
    """ element 0 is most recent """
    stack_name_prefix = stack_name_prefix or env.stack_name_prefix
    stack_names = get_stack_names()
    stack_name_pattern = stack_name_prefix + "(\d+)"
    stack_names = []
    for stack_name in get_stack_names():
        m = re.search(stack_name_pattern, stack_name)
        if m is not None:
            stack_number = int(m.groups(0)[0])
            stack_names.append( (stack_number, stack_name) )

    stack_names.sort(key=lambda x: x[0], reverse=True)
    return [ x[1] for x in stack_names ]

def get_best_guess_active_stack_name(stack_name_prefix=None):
    """ best guess what the active stack is for the given host configuration """
    return get_sorted_active_stack_names(stack_name_prefix=stack_name_prefix)[0]

def pull_external_config():
    """ fetches the current version of the external_config, ideal if you want to update them """
    zip_name = env.external_config_zip_name
    build_folder = get_temp_build_dir(get_external_config_temp_folder())
    external_config_folder = os.path.join(build_folder, "external_config")
    
    with lcd(build_folder):
        local("rm -Rf *")
        download_from_s3(zip_name, bucket_name=env.s3_bucket_name_external_config, local_folder=build_folder)
        local("unzip {zip_name}".format(zip_name=zip_name))
        print("External config downloaded to {external_config_folder}".format(external_config_folder=external_config_folder))
        print("Host folder is at %s" % get_host_path_for_temp_path(external_config_folder))

def push_external_config():
    """ assumes you have made changes to external_config, and want to upload them. 
        to make them take effect, look at refresh_application_external_config
    """
    build_folder = get_temp_build_dir(get_external_config_temp_folder())
    zip_name = env.external_config_zip_name
    zip_path = os.path.join(build_folder, zip_name)
    external_config_filepath = "%s/%s" % (env.mapped_temp_dir, get_external_config_temp_folder())

    local_external_config_folder_to_upload = os.path.join(build_folder, "external_config")
    print("Uploading external config from %s" % local_external_config_folder_to_upload)
    if not os.path.exists(local_external_config_folder_to_upload):
        print("External config not found at %s" % local_external_config_folder_to_upload)
        exit(1)
        
    with lcd(build_folder):
        with settings(warn_only=True):
            local("rm -f {zip_name}".format(zip_name=zip_name))
        local("zip -r {zip_name} external_config/*".format(zip_name=zip_name))
        print("Zip created at {zip_path}".format(zip_path=zip_path))
        upload_to_s3(zip_path, bucket_name=env.s3_bucket_name_external_config)

def refresh_external_config(aws_instance_name=None):
    """ refetches external_config from s3, useful after push_external_config """
    aws_instance_data = get_best_application_instance_data(aws_instance_name=aws_instance_name)
    env.host_string = aws_instance_data["PublicDnsName"] # note: because env.hosts can't be changed at this point
    zip_name = env.external_config_zip_name
    aws_path="s3://{bucket_name}/{filename}".format(
        bucket_name=env.s3_bucket_name_external_config,
        filename=zip_name)

    print("""If the below command fails due to password or permission errors, try ssh in and run them manually:
               cd /opt/imptime/docker_compose
               sudo apt install -y awscli unzip
               sudo aws s3 cp {aws_path} . --region {region}
               sudo unzip -o {zip_name} """.format(
                   aws_path=aws_path,
                   zip_name=zip_name,
                   region=env.aws_region))
    
    with cd("/opt/imptime/docker_compose"):
        run("sudo apt install -y awscli unzip")
        run("sudo aws s3 cp {aws_path} . --region {region}"\
            .format(aws_path=aws_path, region=env.aws_region))
        run("sudo unzip -o {zip_name}".format(zip_name=zip_name))

def tail_deploy(aws_instance_name=None):
    _tail_until(aws_instance_name, "/var/log/cloud-init-output.log", "finished with status")
    _tail_until(aws_instance_name, "/var/log/cfn-init-cmd.log", "Completed successfully")
    _tail_until(aws_instance_name, "/var/log/cfn-init.log", "Build complete")
    print("Tail deploy complete")

def _tail_until(aws_instance_name, remote_filename, final_regex):
    aws_instance_data = get_best_application_instance_data(aws_instance_name=aws_instance_name)
    env.host_string = aws_instance_data["PublicDnsName"] # note: because env.hosts can't be changed at this point
    with settings(warn_only=True):
        run("""sh -c 'tail --follow=name --retry --pid=$$ -f %s | { sed "/%s/ q" && kill $$ ;}'""" % (remote_filename, final_regex))
        print("Tail ended, triggered on %s" % final_regex)

def wait_for_instance_available(aws_instance_name=None):
    aws_instance_data = get_best_application_instance_data(aws_instance_name=aws_instance_name)
    env.host_string = aws_instance_data["PublicDnsName"]

    count = 60
    ex = None
    while count>0:
        print("Waiting %d more seconds for instance to be available" % count)
        try:
            run("""sleep 1""")
            print("Server available")
            return
        except NetworkError:
            count -= 1
            time.sleep(1)
    raise Exception("Failed to connect to server: %s %s" % (aws_instance_name, ex))

def allow_ip(description, ip_address=None):
    ip_address = ip_address or requests.get('https://api.ipify.org').text

    security_info = get_security_info()
    for ip_range in security_info["SecurityGroups"][0]["IpPermissions"][0]["IpRanges"]:
        if ip_range.get("Description", None) == description:
            print("Deleting existing security range: %s" % ip_range["CidrIp"])
            delete_security_range(ip_range["CidrIp"])
    
    packet = [{"IpProtocol":"tcp", "FromPort":22, "ToPort":22, "IpRanges":[{"CidrIp":ip_address+"/24",
                                                                            "Description":description}]}]
    
    local("aws ec2 authorize-security-group-ingress --region {aws_region} --group-id {group_id} --ip-permissions '{packet}'"\
          .format(group_id=env.aws_security_group, packet=json.dumps(packet), aws_region=env.aws_region))

    print("Added your ip address")

def get_security_info():
    existing_groups = local(("aws ec2 describe-security-groups " +
                             "--region {aws_region} " +
                             "--group-ids {group_id}").format(
                                 aws_region=env.aws_region,
                                 group_id=env.aws_security_group),
                            capture=True)
    return json.loads(existing_groups)
    
def delete_security_range(ip_address_range):
    local("aws ec2 revoke-security-group-ingress --port 22 --protocol tcp --region {aws_region} --group-id {group_id} --cidr {ip_address_range}"\
          .format(group_id=env.aws_security_group, ip_address_range=ip_address_range, aws_region=env.aws_region))
    
