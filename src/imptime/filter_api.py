import logging
from issue_serializer import IssueSerializer
from issue_serializer import IssueGeneralDetailsSerializer
from django.db.models import Sum, Count, Q, F, Max, Min
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Issue
from timepiece.models import Project as Sprint
from timepiece.models import Business as Project
from filter_serializer import ProjectResultSerializer, SprintResultSerializer, IssueResultSerializer

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class FilterViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}

            params = json.loads(request.GET['params'])
            filter_args = params['filter'] or {}
            search_term = filter_args['term']
            
            allowed_projects = self.allowed_projects()
            allowed_sprints = self.allowed_sprints()
            allowed_issues = self.allowed_issues()

            active_project_id = request.GET.get('project_id', None)
            active_sprint_id = request.GET.get('sprint_id', None)

            active_project = \
                allowed_projects.get(pk=active_project_id) if active_project_id else None
            active_sprint = \
                allowed_sprints.get(pk=active_sprint_id) if active_sprint_id else None
            matched_issues = None
            matched_sprints = None

            if active_sprint is not None:
                matched_issues = allowed_issues.filter(project__id=active_sprint.id)\
                                               .filter(Q(number__icontains=search_term) |
                                                       Q(subject__icontains=search_term))
                matched_issues = matched_issues.order_by("project__business__name",
                                                         "project__name",
                                                         "subject")
                matched_issues = [x for x in matched_issues[0:500]
                                  if x.project.can_view_by_user(request.user)]
                active_project = None

            elif active_project is not None:
                matched_issues = allowed_issues.filter(project__business__id=active_project.id)\
                                               .filter(Q(number__icontains=search_term) |
                                                       Q(subject__icontains=search_term))
                matched_issues = matched_issues.order_by("project__business__name",
                                                         "project__name",
                                                         "subject")
                matched_issues = [x for x in matched_issues[0:500]
                                  if x.project.can_view_by_user(request.user)]

                matched_sprints = allowed_sprints.filter(business__id=active_project.id)\
                                                 .filter(Q(name__icontains=search_term) |
                                                         Q(id__icontains=search_term) |
                                                         Q(description__icontains=search_term))
                matched_sprints = matched_sprints.filter_by_logged_in_user(request.user)

            issues = allowed_issues.filter(Q(number__icontains=search_term) |
                                           Q(subject__icontains=search_term))\
                                   .order_by("project__business__name",
                                             "project__name",
                                             "subject")
            issues = [x for x in issues[0:500] if x.project.can_view_by_user(request.user)]

            sprints = allowed_sprints.filter(Q(name__icontains=search_term) |
                                             Q(id__icontains=search_term) |
                                             Q(description__icontains=search_term) |
                                             Q(short_description__icontains=search_term))\
                                     .order_by("business__name", "name")
            
            projects = allowed_projects.filter(Q(name__icontains=search_term) |
                                               Q(description__icontains=search_term))\
                                       .order_by("name")

            context['projects'] = ProjectResultSerializer(projects, many=True, result_category='all_projects').data
            context['sprints'] = SprintResultSerializer(sprints, many=True, result_category='all_sprints').data
            context['issues'] = IssueResultSerializer(issues, many=True, result_category='all_issues').data
            context['active_project'] = ProjectResultSerializer(active_project, result_category='given_active_project').data
            context['active_sprint'] = SprintResultSerializer(active_sprint, result_category='given_active_sprint').data
            context['matched_issues'] = IssueResultSerializer(matched_issues, result_category='issues_within_active_sprint').data
            context['matched_sprints'] = SprintResultSerializer(matched_sprints, result_category='sprints_within_active_project').data

            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
