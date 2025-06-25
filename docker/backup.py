import os
import imp
import copy
import ast
import sys
import subprocess
import datetime
import logging

logging.basicConfig(filename='/opt/imptime/logs/backup.log',level=logging.DEBUG)

os.environ["LANG"] = "en_GB.UTF-8"

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger=logging.getLogger(__name__)
logger.addHandler(console_handler)

CONFIG_FOLDER="/opt/imptime/external_config/"
backup_folder = "/opt/imptime/backups"
AWS_BIN="/opt/awscli/aws-cli/bin/aws"

def _cmd(cmd, args, env_variables=None):
    logger.info(cmd)
    cmd_env = os.environ.copy()
    if env_variables:
        cmd_env.update(env_variables)
    subprocess.check_output([cmd]+args, env=cmd_env)

def _shell_cmd(cmd, args):
    shell_cmd = cmd + " ".join(args)
    logger.info(shell_cmd)
    p = subprocess.Popen(shell_cmd, shell=True, stdout=subprocess.PIPE)
    while p.poll() is None:
        out = p.stdout.read(1)
        sys.stdout.write(out)
        sys.stdout.flush()    
    
def _import_db_settings(settings_file):
    global CONFIG_FOLDER
    imported_db_settings = []
    ast_settings = ast.parse(''.join(open(os.path.join(CONFIG_FOLDER,settings_file)))).body
    for ast_setting in ast_settings:
        if hasattr(ast_setting, "targets") and ast_setting.targets[0].id == 'DATABASES':
            database_settings = eval(compile(ast.Expression(ast_setting.value), "<ast_expression>", "eval"))
            for db_key, values in database_settings.items():
                key = settings_file+"_"+db_key
                sanitized_values = copy.deepcopy(values)
                sanitized_values['PASSWORD'] = 'xxx'
                logger.debug("Found database setting: %s=%s " % (key, sanitized_values))
                imported_db_settings.append(values)
    return imported_db_settings
    
def do_db_backup(db_name, db_host, db_user, db_password, output_folder):
    pg_pass_file = "/opt/imptime/external_config/.pgpass"
    output_filepath = os.path.join(output_folder, "%s.pgdump"%db_name)
    logger.info("Backing up %s to %s" % (db_name, output_filepath))
    with open(pg_pass_file, "w") as f:
        f.write("{db_host}:5432:*:{db_user}:{db_password}\n"\
                .format(db_host=db_host,
                        db_name=db_name,
                        db_user=db_user,
                        db_password=db_password))
    os.chmod(pg_pass_file, 0600)
    _cmd("pg_dump", ["-h", db_host, "-U", db_user, "-Fc", db_name, "-f", output_filepath],
         env_variables={'PGPASSFILE':pg_pass_file})

def do_s3_backup(aws_region, aws_profile_name, s3_bucket_name, output_folder):
    output_filepath = os.path.join(output_folder, "s3")
    logger.info("Backing up %s to %s" % (s3_bucket_name,output_filepath))
    cmd_args = ["s3", "cp", "--region", aws_region]
    if aws_profile_name:
        cmd_args.extend(["--profile", aws_profile_name])
    cmd_args.extend(["--recursive", "--exclude", '"*logs/*', s3_bucket_name, output_folder])
    
    _cmd(AWS_BIN, cmd_args)
    
def create_zip(backup_folder, timestamp):
    zip_filename = "imptime_backup_%s.zip" % timestamp
    zip_filepath = os.path.join(backup_folder, zip_filename)
    logger.info("Zipping to {zip_filepath}".format(zip_filepath=zip_filepath))
    _cmd("zip", ["-r", zip_filepath, output_folder])
    return zip_filepath
    
def ftp_upload_backup(ftp_user, ftp_password, ftp_host, zip_filepath, dest_folder):
    logger.info("ftping %s to %s" % (zip_filepath, dest_folder))
    ftp_user_and_password = "%s%s%s" % (ftp_user, "," if ftp_password else "", ftp_password)
    lftp_script = "set ftp:ssl-protect-data true; set ssl:verify-certificate false; open -u {ftp_user_and_password} {ftp_host}; put -O {ftp_dest_folder} {zip_filepath}"\
        .format(ftp_user_and_password=ftp_user_and_password,
                ftp_host=ftp_host,
                ftp_dest_folder=dest_folder,
                zip_filepath=zip_filepath)
    with open("/tmp/lftp_script.sh", "w") as f:
        f.write(lftp_script)
    _cmd("lftp", ["-f", "/tmp/lftp_script.sh"])

def do_rsync(local_folder, dest_url, dest_user, dest_folder, dest_port, dest_ssh_key=None, dest_password=None):
    if dest_ssh_key:
        ssh_key_filepath = os.path.join(CONFIG_FOLDER, dest_ssh_key)
        _cmd("chmod", ["0600", ssh_key_filepath])
        cmd_args = ["-rlptghe",]
                    
        cmd_args.extend(["'ssh -i {ssh_key_filepath} -p {dest_port} -o StrictHostKeyChecking=no'"\
                        .format(ssh_key_filepath=ssh_key_filepath, dest_port=dest_port)])
        
    elif dest_password:
        cmd_args.extend(["'/usr/bin/sshpass -p {password} ssh -p {dest_port} -o StrictHostKeyChecking=no'"\
                         .format(password=dest_password, dest_port=dest_port)])

    else:
        raise Exception("Must specify either dest_password or dest_ssh_key")
        
    cmd_args.extend([local_folder,
                     "{dest_user}@{dest_url}:{dest_folder}".format(dest_user=dest_user,
                                                                   dest_url=dest_url,
                                                                   dest_folder=dest_folder)])
        
    _shell_cmd("rsync ", cmd_args)

def do_scp_upload(zip_filepath, ssh_user, ssh_key, ssh_host, ssh_folder):
    ssh_key_filepath = os.path.join(CONFIG_FOLDER, ssh_key)
    _cmd("chmod", ["0600", ssh_key_filepath])
    cmd_args = [ "-i",
                 ssh_key_filepath,
                 "-o",
                 "StrictHostKeyChecking=no",
                 zip_filepath,
                 "{ssh_user}@{ssh_host}:{ssh_folder}".format(ssh_user=ssh_user, ssh_host=ssh_host, ssh_folder=ssh_folder) ]
    _cmd("scp", cmd_args)

def do_s3_upload(zip_filepath, aws_region, aws_profile_name, s3_bucket_name):
    logger.info("Backing up %s to %s" % (zip_filepath, s3_bucket_name))
    cmd_args = ["s3", "cp", "--region", aws_region]
    if aws_profile_name:
        cmd_args.extend(["--profile", aws_profile_name])
    cmd_args.extend([zip_filepath, s3_bucket_name])
    _cmd(AWS_BIN, cmd_args)
    
timestamp = datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
if not os.path.exists(backup_folder):
    os.makedirs(backup_folder)
output_folder = os.path.join(backup_folder, timestamp)
os.makedirs(output_folder)

settings_filepath = os.path.join(CONFIG_FOLDER+'backup_local_settings.py')
logger.info("Loading backup settings from %s" % settings_filepath)
settings = imp.load_source('module.name', settings_filepath)

logger.info("Starting imported backup to %s" % output_folder)
for database_config_file in settings.DATABASE_CONFIG_FILES:
    logger.info("Backing up based on %s" % database_config_file)
    db_settings = _import_db_settings(database_config_file)
    for db_setting in db_settings:
        try:
            do_db_backup(db_name=db_setting['NAME'],
                         db_host=db_setting['HOST'],
                         db_user=db_setting['USER'],
                         db_password=db_setting['PASSWORD'],
                         output_folder=output_folder)
        except Exception as ex:
            logger.exception(ex)
            exit(1)
    
logger.info("Starting custom db backup to %s" % output_folder)
for db_key, db_settings in settings.DATABASES.items():
    try:
        do_db_backup(db_name=db_settings['NAME'],
                     db_host=db_settings['HOST'],
                     db_user=db_settings['USER'],
                     db_password=db_settings['PASSWORD'],
                     output_folder=output_folder)
    except Exception as ex:
        logger.exception(ex)
        exit(1)

for s3_settings in settings.S3:
    if s3_settings['ENABLED'] == True:
        try:
            do_s3_backup(aws_region=s3_settings['AWS_REGION'],
                         aws_profile_name=s3_settings['AWS_PROFILE_NAME'],
                         s3_bucket_name=s3_settings['BUCKET_NAME'],
                         output_folder=output_folder)
        except Exception as ex:
            logger.exception(ex)
            exit(1)
    

try:
    zip_filepath = create_zip(backup_folder=backup_folder, timestamp=timestamp)
except Exception as ex:
    logger.exception(ex)
    exit(1)

if settings.FTP['ENABLED'] == True:
    try:
        ftp_upload_backup(ftp_user=settings.FTP['USER'],
                          ftp_password=settings.FTP.get('PASSWORD', None),
                          ftp_host=settings.FTP['HOST'],
                          zip_filepath=zip_filepath,
                          dest_folder=settings.FTP['DEST_FOLDER'])
    except Exception as ex:
        logger.exception(ex)
        exit(1)

for rsync in settings.RSYNC:
    if rsync['ENABLED'] == True:
        try:
            do_rsync(local_folder=rsync['LOCAL_FOLDER'],
                     dest_url=rsync['DEST_URL'],
                     dest_user=rsync['DEST_USER'],
                     dest_folder=rsync['DEST_FOLDER'],
                     dest_port=rsync['DEST_PORT'],
                     dest_ssh_key=rsync.get('DEST_SSH_KEY', None),
                     dest_password=rsync.get('DEST_PASSWORD', None)
            )
        except Exception as ex:
            logger.exception(ex)
            exit(1)

for scp_upload in settings.SCP_UPLOAD:
    if scp_upload['ENABLED'] == True:
        try:
            do_scp_upload(zip_filepath=zip_filepath,
                          ssh_user=scp_upload['USER'],
                          ssh_key=scp_upload['KEY_FILENAME'],
                          ssh_host=scp_upload['HOST'],
                          ssh_folder=scp_upload['FOLDER'])
        except Exception as ex:
            logger.exception(ex)
            exit(1)
        
for s3_upload in settings.S3_UPLOAD:
    if s3_upload['ENABLED'] == True:
        try:
            do_s3_upload(zip_filepath=zip_filepath,
                         aws_region=s3_upload['AWS_REGION'],
                         aws_profile_name=s3_upload['AWS_PROFILE_NAME'],
                         s3_bucket_name=s3_upload['BUCKET_NAME'])
        except Exception as ex:
            logger.exception(ex)
            exit(1)
            
logger.info("Backup process complete for %s" % timestamp)
