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

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class FilterViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}

            search_term = request.GET['search_term']
            active_project_id = request.GET.get('project_id', None)
            active_sprint_id = request.GET.get('sprint_id', None)
            active_project = Project.objects.get(pk=active_project_id)

            active_project = \
                Project.objects.get(pk=active_project_id) if active_project_id else None
            active_sprint = \
                Sprint.objects.get(pk=active_sprint_id) if active_sprint_id else None
            matched_issues = None
            matched_sprints = None

            if active_sprint is not None:
                matched_issues = Issue.objects.filter(project__id=active_sprint.id)\
                                             .filter(Q(number__icontains=search_term) |
                                                     Q(subject__icontains=search_term))
                matched_issues = matched_issues.order_by("project__business__name",
                                                         "project__name",
                                                         "subject")
                matched_issues = [x for x in matched_issues[0:500]
                                  if x.project.can_view_by_user(request.user)]
                active_project = None

            elif active_project is not None:
                matched_issues = Issue.objects.filter(project__business__id=active_project.id)\
                                             .filter(Q(number__icontains=search_term) |
                                                     Q(subject__icontains=search_term))
                matched_issues = matched_issues.order_by("project__business__name",
                                                         "project__name",
                                                         "subject")
                matched_issues = [x for x in matched_issues[0:500]
                                  if x.project.can_view_by_user(request.user)]

                matched_sprints = Sprint.objects.filter(business__id=active_project.id)\
                                                .filter(Q(name__icontains=search_term) |
                                                        Q(id__icontains=search_term) |
                                                        Q(description__icontains=search_term))
                matched_sprints = matched_sprints.filter_by_logged_in_user(request.user)

            issues = Issue.objects.filter(Q(number__icontains=search_term) |
                                          Q(subject__icontains=search_term))
            issues = issues.order_by("project__business__name",
                                     "project__name",
                                     "subject")
            issues = [x for x in issues[0:500] if x.project.can_view_by_user(request.user)]

            sprints = Sprint.objects.filter(Q(name__icontains=search_term) |
                                            Q(id__icontains=search_term) |
                                            Q(description__icontains=search_term) |
                                            Q(short_description__icontains=search_term))
            sprints = sprints.order_by("business__name", "name")
            sprints = sprints.filter_by_logged_in_user(request.user)

            projects = Project.objects.filter(Q(name__icontains=search_term) |
                                              Q(description__icontains=search_term))
            projects = projects.order_by("name")
            projects = projects.filter_by_logged_in_user(request.user)

            context['projects'] = projects
            context['sprints'] = sprints
            context['issues'] = issues
            context['active_project'] = active_project
            context['active_sprint'] = active_sprint
            context['matched_issues'] = matched_issues
            context['matched_sprints'] = matched_sprints

            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
