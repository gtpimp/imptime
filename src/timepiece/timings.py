from time import time
import logging
from django.utils.datastructures import SortedDict
logger = logging.getLogger(__name__)

starts = SortedDict()
totals = SortedDict()

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
    starts = SortedDict()
    totals = SortedDict()
    return "<br/>".join(msg)

    
