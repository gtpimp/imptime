""" One-stop functions for sending emails from anywhere in the project """

import logging
logger = logging.getLogger(__name__)
from datetime import datetime
from django.template import RequestContext, Context
from .models import MailerMessage
from django.conf import settings
from django.template.loader import render_to_string

def queue_admin_email(subject, msg=None):
    msg = msg or subject
    return queue_email(subject_content=subject, text_content="%s\n\n%s" % (subject,msg),
                       html_content="%s<br/><br/>%s" % (subject,msg),
                       to_addresses=settings.MAIL_ADMINS)

def queue_templated_email(request, context, subject_template, text_template, html_template, to_addresses, from_address, 
                          bcc_addresses=None, attachments=None):
    """ will render the templates against the request and context, and then queue the email.

        returns a MailMessage object, onto which you can put the
        attachments instead of using the attachments parameter if you prefer
    """

    bcc_addresses = bcc_addresses or []
    try:
        if settings.EMAIL_TEST_MODE:
            to_addresses = settings.MAIL_ADMINS
    except AttributeError:
        pass

    if request is None:
        request_context = Context(context)
    else:
        request_context = RequestContext(request, context)
    subject_content = render_to_string(subject_template, request_context)
    text_content = render_to_string(text_template, request_context)
    html_content = render_to_string(html_template, request_context)
    return queue_email(subject_content, text_content, html_content, to_addresses, from_address, bcc_addresses, attachments)

def queue_email(subject_content, text_content, html_content, to_addresses, from_address=None,
                bcc_addresses=None, attachments=None):

    msg = MailerMessage(
        subject=str(subject_content.replace("\n","").replace("\r","")[0:100]), 
        content=text_content,
        html_content=html_content,
        to_address=",".join(to_addresses),
        bcc_address=",".join(bcc_addresses or []),
        from_address=from_address or settings.FROM_EMAIL,
        app='imptime',
        created=datetime.today()
        )

    if attachments:
        for f, filename in attachments:
            msg.add_attachment(f, filename)

    msg.save()
    return msg
