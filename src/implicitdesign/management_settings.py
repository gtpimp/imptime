from settings import *
PROJECT_HOME = os.path.dirname(os.path.realpath(__file__))
LOG_FOLDER=os.path.join(PROJECT_HOME, "..", "..", 'logs')
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(message)s'
            },
        'simple': {
            'format': '%(asctime)s %(levelname)s %(message)s'
            },
        },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
            },
        'file':{
            'level':'DEBUG',
            'class':'logging.handlers.RotatingFileHandler',
            'filename':os.path.join(LOG_FOLDER, 'emacs_importer.log'),
            'formatter': 'verbose',
            'maxBytes':604800, 
            'backupCount':50
            }
        },
    'loggers': {
        'django': {
            'handlers':['mail_admins',],
            'propagate': True,
            'level':'DEBUG',
            },
        '': {
            'handlers': ['file',],
            'propagate': True,
            'level': 'DEBUG'
            }
        },
    }

