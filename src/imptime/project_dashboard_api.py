import logging
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import detail_route
from datetime import datetime
from dateutil.relativedelta import relativedelta
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import BusinessPermissions, Entry, Rate
from django.contrib.auth.models import User
import csv

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class ProjectDashboardViewSet(BaseViewSet):

    def list(self, request):
        try:
            params = request.GET.get('params', '{}')
            params = json.loads(params)

            projects = self.allowed_projects().order_by("name")
            project_dashboards = [ self.get_project_dashboard for project in projects ]
            data = {'status': 'success', 'payload': { 'project_dashboards': project_dashboards}}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def get_project_dashboard(self, project):
        return { 'id': project.id }
    
    
