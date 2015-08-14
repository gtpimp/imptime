from time import time
import logging
logger = logging.getLogger(__name__)

starts = {}
totals = {}

def start(name):
    starts[name] = time()
    def call_to_end(name=name):
        return end(name)
    return call_to_end

def end(name):
    duration = time() - starts[name]
    if name in totals:
        totals[name] += duration
    else:
        totals[name] = duration

def results():
    msg = []
    for name, total in totals.items():
        msg.append( "%s took %f" % (name, total))
    logger.info("\n".join(msg))
    return "<br/>".join(msg)

    
