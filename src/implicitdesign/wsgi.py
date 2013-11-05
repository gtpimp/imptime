"""
WSGI config for implicitdesign project.

This module contains the WSGI application used by Django's development server
and any production WSGI deployments. It should expose a module-level variable
named ``application``. Django's ``runserver`` and ``runfcgi`` commands discover
this application via the ``WSGI_APPLICATION`` setting.

Usually you will have the standard Django WSGI application here, but it also
might make sense to replace the whole Django WSGI application with a custom one
that later delegates to the Django one. For example, you could introduce WSGI
middleware here, or combine a Django application with an application of another
framework.

"""
import os
import sys 

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "implicitdesign.settings")

# Add extra imports, add more as needed, apache won't find anything in venv/src by default
sys.stdout = sys.stderr
PROJECT_HOME= os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "..")
VENV_HOME = os.path.join(PROJECT_HOME, "venv")
SRC_HOME = os.path.join(PROJECT_HOME, "src")
sys.path.append(SRC_HOME)
sys.path.append(VENV_HOME + '/src/xhtml2pdf')
sys.path.append(VENV_HOME + '/src/django-pipeline')
sys.path.append(VENV_HOME + '/src/unicodecsv')
sys.path.insert(0, VENV_HOME + '/lib/python2.7/site-packages')

sys.stdout = sys.stderr

# Setup celery (cron jobs)
#import djcelery
#djcelery.setup_loader()

# This application object is used by any WSGI server configured to use this
# file. This includes Django's development server, if the WSGI_APPLICATION
# setting points here.
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# Apply WSGI middleware here.
# from helloworld.wsgi import HelloWorldApplication
# application = HelloWorldApplication(application)
