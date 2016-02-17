from settings import *

PROJECT_HOME = os.path.dirname(os.path.realpath(__file__))
LOG_FOLDER=os.path.join(PROJECT_HOME, "..", "..", 'logs')

LOGGING['handlers']['file']['filename'] = os.path.join(LOG_FOLDER, "nagios.log")

