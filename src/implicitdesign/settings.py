# Django settings for implicitdesign project.
import sys
import os

DEBUG = True
TEMPLATE_DEBUG = DEBUG
PROJECT_HOME = os.path.dirname(os.path.realpath(__file__))
VENV_HOME = os.path.join(PROJECT_HOME, "..", "..", "venv")
LOG_FOLDER=os.path.join(PROJECT_HOME, "..", "..", 'logs')

ADMINS = (
    ('Gareth Priede', 'gtp@implicitdesign.co.za'),
)

MANAGERS = ADMINS

REDMINE_DB_MAPPING = [ { 'username' : 'test',
                         'business' : 'projects', 
                         'db' : 'redmine_projects' }
                       ]

TRAFFIC_LEVEL_YELLOW = 70
TRAFFIC_LEVEL_RED = 90

# This setting is intentionally left invalid
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': '',                      # Or path to database file if using sqlite3.
        'USER': '',                      # Not used with sqlite3.
        'PASSWORD': '',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
    },
    'redmine_projects': {
        'ENGINE': 'django.db.backends.', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': '',                      # Or path to database file if using sqlite3.
        
        'USER': '',                      # Not used with sqlite3.
        'PASSWORD': '',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
        },
    'redmine_unionswiss': {
        'ENGINE': 'django.db.backends.', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': '',                      # Or path to database file if using sqlite3.
        
        'USER': '',                      # Not used with sqlite3.
        'PASSWORD': '',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
        },
    'redmine_hfm': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'redmine_test',                      # Or path to database file if using sqlite3.
        
        'USER': 'redmine',                      # Not used with sqlite3.
        'PASSWORD': 'redmine',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
        },
    'redmine_impact': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'redmine_test',                      # Or path to database file if using sqlite3.
        
        'USER': 'redmine',                      # Not used with sqlite3.
        'PASSWORD': 'redmine',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
        },
    'bamboo': {
        'ENGINE': 'django.db.backends.', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': '',                      # Or path to database file if using sqlite3.
        
        'USER': '',                      # Not used with sqlite3.
        'PASSWORD': '',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
        },
    
}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'Africa/Johannesburg'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = False

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = os.path.join(PROJECT_HOME, "media")

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = '/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

# Additional locations of static files
STATICFILES_DIRS = (os.path.join(PROJECT_HOME, 'static/'), 
                    )

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)
#STATICFILES_STORAGE = 'pipeline.storage.PipelineCachedStorage'
# PIPELINE_CSS = {
#     'colors': {
#         'source_filenames': (
#           'css/core.css',
#           'css/colors/*.css',
#           'css/layers.css'
#         ),
#         'output_filename': 'css/colors.css',
#         'extra_context': {
#             'media': 'screen,projection',
#         },
#     },
# }

# PIPELINE_COMPILERS = (
#   'pipeline.compilers.less.LessCompiler',
# )

# PIPELINE_JS = {
#     'stats': {
#         'source_filenames': (
#           'js/jquery.js',
#           'js/d3.js',
#           'js/collections/*.js',
#           'js/application.js',
#         ),
#         'output_filename': 'js/stats.js',
#     }
# }

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'jvo(l47k$=imb)hy29kl+^0n6n@r41eoi_96&amp;6#@57!r1cl%8&amp;6'

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.contrib.messages.context_processors.messages",
    "django.core.context_processors.request",
    'django.core.context_processors.static',
    "timepiece.context_processors.extra_nav",
    "timepiece.context_processors.active_entries",
)

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.transaction.TransactionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'pagination.middleware.PaginationMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'implicitdesign.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'implicitdesign.wsgi.application'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(PROJECT_HOME, "templates"),
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'grappelli',
    'filebrowser',
    'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
    
    'bootstrap_toolkit',
    'pagination',
    'selectable',
    'pipeline',
    'dateutil',
    'djcelery',

    'timepiece',
    'south',
    'emacs_importer',
    'implicitdesign'

)

PAGINATION_DEFAULT_PAGINATION=50

import djcelery
djcelery.setup_loader()
CELERYBEAT_CHDIR=PROJECT_HOME
CELERYBEAT=PROJECT_HOME+"manage.py celerybeat"
CELERYBEAT_OPTS="--schedule=/var/run/celerybeat-schedule"

EMACSIMPORTER_TIMESHEET_ROOT_FOLDER='/home/gtp/id/timesheets'
EMACSIMPORTER_NUM_HISTORICAL_DAYS=60
EMACSIMPORTER_EMAIL_FROM='gtp@implicitdesign.co.za'
EMACSIMPORTER_POINTPERSON_USERNAME='gtp'
EMACSIMPORTER_RATES = { "test":{"id-test.org":50,
                                "id-koen.org":100,
                                "id-fonk.org":200} }
EMACSIMPORTER_TEMP_DIR = "/tmp"
EMACS_USERS_TO_PROCESS = ["test", ]
EMACS_ADMIN_USER_EMAILS = ["gtp@implicitdesign.co.za",]

# # These urls may need to be specified on a production server when the site it not hosted at the root domain.
#LOGIN_URL=
#LOGOUT_URL=
LOGIN_REDIRECT_URL = "/"

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
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
            'filename':os.path.join(LOG_FOLDER, 'impwebsite.log'),
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

#EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_USE_TLS = True
#EMAIL_HOST = 'mail.implicitdesign.co.za'
EMAIL_HOST = 'localhost'
EMAIL_HOST_USER = 'timesheet@implicitdesign.co.za'
EMAIL_HOST_PASSWORD = 'WRONG'
    # EMAIL_PORT = 587


#################
#
# DON'T PUT ANY MORE SETTINGS AFTER THIS POINT, OTHERWISE local_settings.py CAN'T OVERRIDE THEM
#
#
if os.path.exists(os.path.join(PROJECT_HOME,"local_settings.py")):
    from local_settings import *

if os.path.exists(os.path.join(PROJECT_HOME,"version_number.py")):
    from version_number import *
else:
    VERSION_NUMBER="dev"

#check that required settings are set
if DATABASES['default']['ENGINE'] == 'django.db.backends.':
    raise Exception("Unconfigured databases setting, please correct in local_settings.py")

