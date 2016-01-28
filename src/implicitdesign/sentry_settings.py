from django.conf import settings
import os

INSTALLED_APPS = tuple(['raven.contrib.django.raven_compat'] + list(settings.INSTALLED_APPS))
MIDDLEWARE_CLASSES = tuple(
    ['raven.contrib.django.raven_compat.middleware.Sentry404CatchMiddleware'] + list(settings.MIDDLEWARE_CLASSES) +
    ['raven.contrib.django.raven_compat.middleware.SentryResponseErrorIdMiddleware']
)

PROJECT_HOME = os.path.dirname(os.path.realpath(__file__))
LOG_FOLDER=os.path.join(PROJECT_HOME, "..", "..", 'logs')
LOG_FILENAME="imptime.log"
LOG_LEVEL="INFO"


LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(process)d %(filename)s %(lineno)d: %(message)s'
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
        'sentry': {
            'level': 'ERROR',
            'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler',
        },
        'file':{
            'level':'DEBUG',
            'class':'logging.handlers.RotatingFileHandler',
            'filename':os.path.join(LOG_FOLDER, LOG_FILENAME),
            'formatter': 'verbose',
            'maxBytes':604800, 
            'backupCount':50
        },
         'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        }
    },
    'loggers': {
        'django': {
            'handlers':['mail_admins',],
            'propagate': True,
            'level':'INFO',
        },
        'raven': {
            'level': 'DEBUG',
            'handlers': ['console'],
            'propagate': False,
        },
        '': {
            'handlers': ['file',],
            'propagate': True,
            'level': LOG_LEVEL
        }
    },
}

