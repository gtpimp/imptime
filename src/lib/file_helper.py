from django.conf import settings
from django.core.files.storage import default_storage as storage
from django.http import HttpResponse
from datetime import datetime
import requests
import os
import unicodecsv as csv

def download_media(request, url, content_type, filename=None, as_attachment=False):
    if 's3' in settings.DEFAULT_FILE_STORAGE:
        storage_url = storage.url(url)
        res = requests.get(storage_url)
        response = HttpResponse(res.content)
        response['content-type'] = res.headers['content-type']
    else:
        with open(os.path.join(settings.MEDIA_ROOT, url)) as f:
            response = HttpResponse(f.read())
        response['content-type'] = content_type
            
    if as_attachment and filename:
        response['Content-Disposition'] = 'attachment; filename="%s"' % filename
    return response

def prepare_csv(request, filename_prefix):
    response = HttpResponse(content_type='text/csv')
    filename = filename_prefix + "_at_{now}.csv".format(now=datetime.now().strftime("%d%b%Y_%H%M"))
    response['Content-Disposition'] = 'attachment; filename="%s"' % filename
    writer = csv.writer(response)
    return response, writer
