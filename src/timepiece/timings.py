from time import time
import logging
from collections import OrderedDict
logger = logging.getLogger(__name__)

starts = OrderedDict()
totals = OrderedDict()

def start(name):
    starts[name] = time()

def end(name):
    duration = time() - starts[name]
    if name in totals:
        totals[name] += duration
    else:
        totals[name] = duration

def results():
    global starts
    global totals
    msg = []
    for name, total in totals.items():
        msg.append( "%s took %f" % (name, total))
    logger.info("\n".join(msg))
    starts = OrderedDict()
    totals = OrderedDict()
    return "<br/>".join(msg)

    
