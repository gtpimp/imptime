from django.conf import settings
import os
from django.db import transaction
import uuid
import time
import tempfile
import subprocess

def create_pdf(url):
    try:
        import pdb; pdb.set_trace()
        filename = os.path.join(settings.PDF_TEMP_FOLDER, str(uuid.uuid4())+".pdf")
        with transaction.commit_manually():
            transaction.commit()
        res = subprocess.call([os.path.join("phantomjs", "bin", "phantomjs"), "create_pdf.js", url, filename],
                              cwd=os.path.dirname(os.path.realpath(__file__)),
                              stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        if res != 0:
            raise Exception("Failed to execute phantomjs. Exit code is %s" % res)
        
        content = open(filename).read()
        return content
    finally:
        os.remove(filename)
        with transaction.commit_manually():
            transaction.commit()
