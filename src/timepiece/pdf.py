from io import StringIO
import os
from django.conf import settings
from xhtml2pdf import pisa  

def render_to_pdf(html):
    
    def fetch_resources(uri, rel):
        """pisa doesn't handle links to non-physical objects well,
        this function is a hook which returns a physical entity."""
        path = os.path.join(settings.STATIC_ROOT, uri.replace(settings.STATIC_URL, "")).replace("//", "/")
        return path

    result = StringIO.StringIO()
    pdf = pisa.pisaDocument(StringIO.StringIO(html.encode("ISO-8859-1")), result, link_callback=fetch_resources)
    if pdf.err:
        raise Exception(pdf.err)
    return result.getvalue()
