# -*- coding: utf-8 -*-

import urllib
import subprocess
import os
import uuid
import urlparse
from itertools import chain
from subprocess import call
from time import sleep
from django.conf import settings
from django.http import HttpResponse
import json
from django.utils import six
import logging
logger=logging.getLogger(__name__)

# Some code taken from https://github.com/namespace-ee/django-puppeteer-pdf (MIT)

class PuppeteerHelper():

    def url_to_pdf(self, request, url, basename, additional_pdf_kwargs):
        output_filepath = os.path.join(settings.PUPPETEER_TEMP_DIR, '{0}.pdf'.format(uuid.uuid4()))
        self._puppeteer_to_pdf(url, output_filepath, additional_pdf_kwargs)
        response = self._create_attachment_response(output_filepath, basename)
        # os.remove(output_filepath)
        return response

    def _puppeteer_to_pdf(self, url, output_filepath, additional_pdf_kwargs):
        options = settings.PUPPETEER_PDF_CMD_OPTIONS

        if options is None:
            options = {'path': output_filepath}
        else:
            options = copy(options)
        options.update(additional_pdf_kwargs)

        cmd = os.path.join(os.path.realpath(os.path.dirname(__file__)), "impd_puppeteer.js")
        ck_args = list(chain([cmd],
                             [url],
                             self._options_to_args(options)))

        sub_cmd = ' '.join(ck_args)
        
        logger.debug(sub_cmd)
        subprocess.call(sub_cmd, shell=True)
    
    def _create_attachment_response(self, pdf_filepath, basename):
        try:
            pdf_file = open(pdf_filepath, 'rb')
        except IOError, ex:
            logger.exception(ex)
            raise Exception("The PDF was not created")

        response = HttpResponse(pdf_file, content_type='application/force-download')
        extension = '.pdf'
        if not os.path.splitext(basename)[1]:
            basename = basename + extension
        content_disposition = 'attachment; filename="%s"' % (basename)
        response['Content-Disposition'] = content_disposition

        return response

    def _options_to_args(self, options):
        NO_ARGUMENT_OPTIONS = ['-dhf', '--displayHeaderFooter', '-ht', '--printBackground', '-l', '--landscape',
                               '-h', '--help', '-V', '--version']
        
        flags = []
        for name in sorted(options):
            value = options[name]
            formatted_flag = '--%s' % name if len(name) > 1 else '-%s' % name
            formatted_flag = formatted_flag.replace('_', '-')
            accepts_no_arguments = formatted_flag in NO_ARGUMENT_OPTIONS
            if value is None or (value is False and accepts_no_arguments):
                continue
            flags.append(formatted_flag)
            if accepts_no_arguments:
                continue
            flags.append(six.text_type(value))
        return flags

    

def render_url_to_pdf(request, url, basename, **kwargs):
    puppeteer = PuppeteerHelper()
    url = settings.PUPPETEER_BASE_URL + url
    response = puppeteer.url_to_pdf(request, url, basename, additional_pdf_kwargs=kwargs)
    return response
