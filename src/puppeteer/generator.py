# -*- coding: utf-8 -*-

import urllib
import os
import uuid
import urlparse
from subprocess import call
from time import sleep
from django.conf import settings
from django.http import HttpResponse
import json
import logging
logger=logging.getLogger(__name__)

# Some code taken from https://github.com/namespace-ee/django-puppeteer-pdf (MIT)

class PuppeteerHelper():

    def url_to_pdf(request, url, basename, additional_pdf_kwargs):
        output_filepath = os.path.join(settings.PUPPETEER_TEMP_DIR, '{0}.pdf'.format(uuid.uuid4()))
        puppeteer_to_pdf(url, output_filepath, additional_pdf_kwargs)
        response = self._return_response(output_filepath, basename)
        # os.remove(output_filepath)
        return response

    def puppeteer_to_pdf(url, output_filepath, additional_pdf_kwargs):
        options = settings.PUPPETEER_PDF_CMD_OPTIONS
        if options is None:
            options = {'path': output_filepath}
        else:
            options = copy(options)
        options.update(additional_pdf_kwargs)

        cmd = settings.PUPPETEER_PDF_CMD
        ck_args = list(chain([cmd],
                             [url],
                             _options_to_args(**options)))

        sub_cmd = ' '.join(ck_args)
        logger.debug(sub_cmd)
        subprocess.call(sub_cmd, shell=True)

        with open(output_filepath, "rb") as f:
            content = f.read()
        os.remove(output_filepath)
        
        return content
    
    def _return_response(self, pdf_filepath, basename):
        try:
            pdf_file = open(pfd_filepath, 'rb')
        except IOError, ex:
            logger.exception(ex)
            raise Exception("The PDF was not created")

        response = HttpResponse(
            pdf_file,,
            content_type='application/force-download'
        )
        extension = '.pdf'
        if not os.path.splitext(basename)[1]:
            basename = basename + extension
        content_disposition = 'attachment; filename="%s"' % (basename)
        response['Content-Disposition'] = content_disposition

        return response


def render_url_to_pdf(url, request, basename, **kwargs):
    puppeteer = PuppeteerHelper()
    response = puppeteer.url_to_pdf(request, url, basename, additional_pdf_kwargs=kwargs)
    return response
