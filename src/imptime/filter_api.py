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
            search_term = filter_args.get('term', None)
            selected_project_ids = filter_args.get('selected_project_ids', None)
            selected_sprint_ids = filter_args.get('selected_sprint_ids', None)
            selected_issue_ids = filter_args.get('selected_issue_ids', None)
            
            allowed_projects = self.allowed_projects()
            allowed_sprints = self.allowed_sprints()
            allowed_issues = self.allowed_issues()

            if search_term is None:
                allowed_issues = allowed_issues.none()
                allowed_sprints = allowed_sprints.none()
                allowed_projects = allowed_projects.none()
            else:
                allowed_issues = allowed_issues.filter(Q(number__icontains=search_term) |
                                                        Q(subject__icontains=search_term))\
                                               .order_by("project__business__name",
                                                         "project__name",
                                                         "subject")\
                                               .select_related('project')\
                                               .select_related('project__business')
                allowed_sprints = allowed_sprints.filter(Q(name__icontains=search_term) |
                                                         Q(id__icontains=search_term) |
                                                         Q(description__icontains=search_term) |
                                                         Q(short_description__icontains=search_term))\
                                                 .order_by("business__name", "name")\
                                                 .select_related('business') #sic
                allowed_projects = allowed_projects.filter(Q(name__icontains=search_term) |
                                                           Q(id__icontains=search_term) |
                                                           Q(description__icontains=search_term))\
                                                   .order_by("name")

            issues_within_selected_sprints = []
            sprints_within_selected_projects = []
            issues_within_selected_issues = []

            if selected_sprint_ids:
                issues_within_selected_sprints = allowed_issues.filter(project__id__in=selected_sprint_ids) # sic
                issues_within_selected_sprints = issues_within_selected_sprints.order_by("project__business__name",
                                                         "project__name",
                                                         "subject")
                issues_within_selected_sprints = [x for x in issues_within_selected_sprints[0:500]
                                  if x.project.can_view_by_user(request.user)]

            if selected_project_ids:
                issues_within_selected_projects = allowed_issues.filter(project__business__id__in=selected_project_ids) # sic
                issues_within_selected_projects = issues_within_selected_projects.order_by("project__business__name",
                                                         "project__name",
                                                         "subject")
                issues_within_selected_projects = [x for x in issues_within_selected_projects[0:500]
                                  if x.project.can_view_by_user(request.user)]

                sprints_within_selected_projects = allowed_sprints.filter(business__id__in=selected_project_ids)
                sprints_within_selected_projects = sprints_within_selected_projects.filter_by_logged_in_user(request.user)

            if selected_issue_ids:
                issues_within_selected_issues = allowed_issues.filter(id__in=selected_issue_ids)
                
            issues = allowed_issues
            sprints = allowed_sprints
            projects = allowed_projects

            max_results = 7
            
            context['all_projects'] = ProjectResultSerializer(projects[0:max_results], many=True, result_category='all_projects').data
            context['all_sprints'] = SprintResultSerializer(sprints[0:max_results], many=True, result_category='all_sprints').data
            context['all_issues'] = IssueResultSerializer(issues[0:max_results], many=True, result_category='all_issues').data
            context['issues_within_selected_issues'] = IssueResultSerializer(issues_within_selected_issues[0:max_results], many=True, result_category='issues_within_selected_issues').data
            context['issues_within_selected_sprints'] = IssueResultSerializer(issues_within_selected_sprints[0:max_results], many=True, result_category='issues_within_selected_sprints').data
            context['issues_within_selected_projects'] = IssueResultSerializer(issues_within_selected_projects[0:max_results], many=True, result_category='issues_within_selected_projects').data
            context['sprints_within_selected_projects'] = SprintResultSerializer(sprints_within_selected_projects[0:max_results], many=True, result_category='sprints_within_selected_projects').data

            context['selected_project_ids'] = selected_project_ids
            context['selected_sprint_ids'] = selected_sprint_ids
            context['selected_issue_ids'] = selected_issue_ids
            
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
