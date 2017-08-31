from django.conf import settings
from django.core.files.storage import default_storage as storage
from django.http import HttpResponse
import requests
import os

def download_media(request, url, content_type):
    if 's3' in settings.DEFAULT_FILE_STORAGE:
        storage_url = storage.url(url)
        res = requests.get(storage_url)
        response = HttpResponse(res.content)
        response['content-type'] = res.headers['content-type']
        return response
    else:
        with open(os.path.join(settings.MEDIA_ROOT, url)) as f:
            response = HttpResponse(f.read())
            return response

