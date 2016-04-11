ADMINS = (
    ('mkhululi', 'mkhululi@implicitdesign.co.za'),
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycop2', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'imptime',                      # Or path to database file if using sqlite3.
        'USER': 'postgres',                      # Not used with sqlite3.
        'PASSWORD': 'password',                  # Not used with sqlite3.
        'HOST': 'localhost',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
    },
    
}


EMACSIMPORTER_TIMESHEET_ROOT_FOLDER='/home/mkhululi/gtd/'
EMACS_USERS_TO_PROCESS = ["mkhululi"]

INTERNAL_IPS = ('127.0.0.1',)

PROFILE_LOG_BASE="/home/mkhululi/Desktop/"

STATIC_ROOT = "/home/mkhululi/id/timesheet/static"
