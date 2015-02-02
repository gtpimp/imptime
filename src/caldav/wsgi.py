import os
import sys 

sys.stdout = sys.stderr
PROJECT_HOME= os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "..")
VENV_HOME = os.path.join(PROJECT_HOME, "venv")
SRC_HOME = os.path.join(PROJECT_HOME, "src")
sys.path.insert(0, VENV_HOME + '/lib/python2.7/site-packages')

sys.stdout = sys.stderr

import radicale
radicale.log.start()
application = radicale.Application()
