from django.conf import settings
import os
import uuid
import time
import tempfile
import subprocess

def create_pdf(url):
    try:
        filename = os.path.join(settings.PDF_TEMP_FOLDER, str(uuid.uuid4())+".pdf")
        res = subprocess.call([os.path.join("phantomjs", "bin", "phantomjs"), "create_pdf.js", url, filename],
                              cwd=os.path.dirname(os.path.realpath(__file__)),
                              stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        if res != 0:
            raise Exception("Failed to execute phantomjs. Exit code is %s" % res)
        
        content = open(filename).read()
        return content
    finally:
        os.remove(filename)
