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
MAIL_ADMINS = [ "gtp@implicitdesign.co.za" ]

MANAGERS = ADMINS

REDMINE_DB_MAPPING = [ { 'username' : 'test',
                         'business' : 'projects', 
                         'db' : 'redmine_projects' }
                       ]

SESSION_EXPIRE_AT_BROWSER_CLOSE = True

TRAFFIC_LEVEL_YELLOW = 70
TRAFFIC_LEVEL_RED = 90

NUM_DAYS_FOR_TRAFFIC_SPRINT_CHECKLISTS=3
NUM_DAYS_FOR_FINANCE_SPRINT_CHECKLISTS=5
NUM_DAYS_FOR_DEV_SPRINT_CHECKLISTS=2

# Maximum number of days before expecting a new development timesheet
# entry for a particular project. This is used to raise an alarm if
# either nothing is happening in a sprint or if the timesheet isn't
# being imported correctly.
EXPECTING_A_TIMESHEET_ENTRY_EVERY_X_DAYS = 4

# This setting is intentionally left invalid
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'imptime',                      # Or path to database file if using sqlite3.
        'USER': 'imp',                      # Not used with sqlite3.
        'PASSWORD': 'imp',                  # Not used with sqlite3.
        'HOST': 'localhost',                      # Set to empty string for localhost. Not used with sqlite3.
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

NUM_BUSINESS_HOURS_PER_DAY = 8

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = '/media/'

DJIKI_IMAGES_PATH='wiki'
DJIKI_AUTHORIZATION_BACKEND="djiki.auth.base.OnlyAuthenticatedEdits"

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = os.path.join(PROJECT_HOME, '..', '..', 'static')

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

PHANTOM_ROOT_DIR = LOG_FOLDER

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
    'bootstrap3',
    'pagination',
    'selectable',
    'pipeline',
    'dateutil',
    'djcelery',
    'colorful',
    'endless_pagination',
    'mailqueue',

    'timepiece',
    'south',
    'emacs_importer',
    'implicitdesign',
    'jira_interface',
    'invoicing',
    'animated_website',

    'sorl.thumbnail',
    'creole',
    'djiki',
)


PAGINATION_DEFAULT_PAGINATION=50
ENDLESS_PAGINATION_PER_PAGE=PAGINATION_DEFAULT_PAGINATION
ENDLESS_PAGINATION_ADD_NOFOLLOW=True #from endless docs: Set to True if your SEO alchemist wants search engines not to follow pagination links.

INVOICE_PAYMENT_DAYS=30

import djcelery
djcelery.setup_loader()
CELERYBEAT_CHDIR=PROJECT_HOME
CELERYBEAT=PROJECT_HOME+"manage.py celerybeat"
CELERYBEAT_OPTS="--schedule=/var/run/celerybeat-schedule"

CALDAV_URL="http://localhost:5232/{USERNAME}/calendar.ics/"
CALDAV_INCOMING_CALDAV_CHANGES_FOLDER=os.path.join(PROJECT_HOME, "..", "..", 'incoming_caldav_changes')

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

PDF_TEMP_FOLDER = "/tmp"
CALDAV_TEMP_FOLDER = "/tmp"

INVOICE_DETAILS={'name':'ImplicitDesign',
                 'address1':'Unit 4, Tramber Place',
                 'address2':'Blake Street',
                 'city':'Cape Town',
                 'postal_code':'7700',
                 'country':'South Africa',
                 'company_reg':'2009/200508/23',
                 'company_vat_nr':'4330258874',
                 'contact_name':'Gareth Priede',
                 'contact_phone':'+27 21 448 7424 / +27 72 679 1763',
                 'contact_email':'gtp@implicitdesign.co.za',
                 'vat_rate':0.14,
                 'vat_rate_percentage':14,
                 
                 'bank_company_name':'IMPLICITDESIGN CC',
                 'bank_name':'Standard Bank',
                 'bank_account_number':'07-310-446-9',
                 'bank_branch_code':'025009',
                 'bank_branch_name':'Rondebosch',
                 'bank_swift_code':'SBZAZAJJ'}


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

FROM_EMAIL="no-reply@imptime.impd.co.za"

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

