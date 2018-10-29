from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from authentication import force_login_by_token
from puppeteer.generator import render_url_to_pdf
from imptime.models import Mien

@permission_classes(())
class PrintViewSet(APIView):
    
    def get(self, request, filename):
        force_login_by_token(request)
        mien_id = request.GET['mien_id']
        mien = Mien.objects.get(user=self.request.user, pk=mien_id)
        render_url = request.GET['url']
        response = render_url_to_pdf(request, render_url, filename, {"mien-id":mien.id})
        return response
