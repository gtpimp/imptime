# Specify a list of local settings files, relative to the
# external_config folder. All databases (using DATABASES settings) in
# each file will be backed up.
DATABASE_CONFIG_FILES = ['api_local_settings.py']

DATABASES = {
    # this section will be auto populated from api_local_settings and ui_local_settings
    # add additional databases here if required
}

S3 = [{'ENABLED': True,
       'AWS_REGION': 'eu-west-1',
       'BUCKET_NAME': 's3://imptime-production-data',
       'AWS_PROFILE_NAME': 'imptime_production_devops'
}]

FTP = {
    'ENABLED': True,
    'USER': 'Imptime',
    'HOST': 'autodiscover.stanfordresourcing.com',
    'PASSWORD': 'ftp password not set', # set to None if there is no password
    'DEST_FOLDER': 'backups/'
}

# If ENABLED=True, then that backup rsync will run. Either one of
# DEST_SSH_KEY or DEST_FOLDER must be specified (if both then
# DEST_SSH_KEY takes precedence). If specified, DEST_SSH_KEY must
# exist in the external_config folder.
RSYNC = [
    { 'ENABLED': False,
      'LOCAL_FOLDER': '/opt/imptime/media/',
      'DEST_URL': 'backups.imptime.co.za',
      'DEST_USER': 'xxx',
      'DEST_PASSWORD': None,
      'DEST_SSH_KEY': 'id_rsa',
      'DEST_FOLDER': '/home/imptime/media_backups',
      'DEST_PORT': 22
    },
    { 'ENABLED': False,
      'LOCAL_FOLDER': '/opt/imptime/backups/',
      'DEST_URL': 'backups.imptime.co.za',
      'DEST_USER': 'xxx',
      'DEST_PASSWORD': None,
      'DEST_SSH_KEY': 'id_rsa',
      'DEST_FOLDER': '/home/imptime/db_backups',
      'DEST_PORT': 22
    }
]

SCP_UPLOAD = [{ 'ENABLED': False,
                'USER': 'backups',
                'KEY_FILENAME': 'backups_id_rsa',
                'HOST': 'dev.impd.co.za',
                'FOLDER': '/home/backups'
}]
