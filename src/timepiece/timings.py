from time import time
import logging
logger = logging.getLogger(__name__)

starts = {}
totals = {}

def start(name):

    starts[name] = time()
    def end(name=name):
        duration = time() - starts[name]
        if name in totals:
            totals[name] += duration
        else:
            totals[name] = duration
    return end

def results():
    msg = []
    for name, total in totals.items():
        msg.append( "%s took %f" % (name, total))
    logger.info("\n".join(msg))
    return "<br/>".join(msg)

    
