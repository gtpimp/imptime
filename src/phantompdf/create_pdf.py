from django.conf import settings
import os
from django.db import transaction
import urllib
import uuid
import time
import tempfile
import subprocess
import logging
logger = logging.getLogger(__name__)

def _flatten_query_dict(qd):
    args = []
    for k,vs in qd.lists():
        for v in vs:
            args.append( (k, v) )
    return args

def create_pdf(url, url_args=None, query_dict=None, extra_kwargs=None):

    """ kwargs can be any key-value pair to pass to the page """
    
    try:
        filename = os.path.join(settings.PDF_TEMP_FOLDER, str(uuid.uuid4())+".pdf")
        with transaction.commit_manually():
            transaction.commit()

        if query_dict:
            url_args = _flatten_query_dict(query_dict)
        if url_args:
            url_params = urllib.urlencode(url_args)
            url = "%s?%s" % (url, url_params)
            
        logger.debug("Creating pdf with url: %s" % url)
        res = subprocess.call([os.path.join("phantomjs", "bin", "phantomjs"), "create_pdf.js", url, filename, settings.STATIC_URL],
                              cwd=os.path.dirname(os.path.realpath(__file__)),
                              stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        if res != 0:
            raise Exception("Failed to execute phantomjs. Exit code is %s" % res)
        
        content = open(filename).read()
        return content
    except Exception, ex:
        logger.exception(ex)
        raise
    finally:
        os.remove(filename)
        with transaction.commit_manually():
            transaction.commit()
