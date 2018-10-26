from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from authentication import force_login_by_session_token
from puppeteer.generator import render_url_to_pdf
from rest_framework.permissions import IsAuthenticated

@permission_classes((IsAuthenticated,))
class PrintViewSet(APIView):
    
    def get(self, request, filename):
        import pdb; pdb.set_trace()
        session_token = request.GET['session_id']
        force_login_by_session_token(request, session_token)
        render_url = request.GET['url']
        response = render_url_to_pdf(request, render_url, filename)
        return response
