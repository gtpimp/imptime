ADMINS = (
    ('akshar', 'akshar@implicitdesign.co.za'),
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'imptime',                      # Or path to database file if using sqlite3.
        'USER': 'imp',                      # Not used with sqlite3.
        'PASSWORD': 'imp',                  # Not used with sqlite3.
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
    'bamboo': {
        'ENGINE': 'django.db.backends.', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': '',                      # Or path to database file if using sqlite3.
        
        'USER': '',                      # Not used with sqlite3.
        'PASSWORD': '',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
        },
    
}


EMACSIMPORTER_TIMESHEET_ROOT_FOLDER='/home/akshar/temp/gtd/'
EMACS_USERS_TO_PROCESS = ["akshar"]

INTERNAL_IPS = ('127.0.0.1',)

PROFILE_LOG_BASE="/home/akshar/Desktop/"

STATIC_ROOT = "/home/akshar/id/timesheet/static"
