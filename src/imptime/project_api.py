import logging
from project_serializer import ProjectSerializer
from django.db.models import Case, When
from rest_framework.decorators import detail_route
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import User
from mailqueue.mailqueue_helper import queue_email
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import BusinessHistory
from timepiece.models import Issue
from imptime.models import VisualSpecProject
from imptime.models import VisualSpecIssue
from timepiece.models import BusinessPermissions as ProjectPermissions
from timepiece.models import BusinessInvite as ProjectInvite
from timepiece.models import UserAutoLoginToken
from timepiece.models import ProjectDeadlineType
from imptime.project_dashboard_api import get_recent_activity


logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class ProjectViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}

            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            projects = self.allowed_projects()
            projects = self.apply_filter(qs=projects,
                                         raw_filter_args=filter_args)

            if format_args.get('ids_only'):
                projects = self.sort_projects(projects)
            projects = self.apply_pagination(qs=projects,
                                             pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in projects.values_list(
                    'id', flat=True)]
            else:
                s = ProjectSerializer(projects,
                                      logged_in_user=self.request.user,
                                      many=True)
                projects_data = s.data
                context['projects'] = projects_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def sort_projects(self, projects):
        sort_keys = []
        for project in projects:
            sort_keys.append( (project.id, get_recent_activity(project)) )
            
        project_ids_in_order = sorted(sort_keys, key=lambda x: x[1]['sort_date'], reverse=True)
        preserved = Case(*[When(pk=pk[0], then=pos) for pos, pk in enumerate(project_ids_in_order)])
        return projects.order_by(preserved)
                                                    
    def update(self, request, pk):
        try:
            params = request.data
            field_name = params['field_name']
            new_value = params['value']

            if 'project_ids' in params:
                project_pks = params['project_ids']
            else:
                project_pks = [pk]

            for project_pk in project_pks:
                project = self.allowed_project(project_pk)
                if field_name == 'name':
                    if self.logged_in_permissions(project).has_edit_project_detail:
                        project.name = new_value
                elif field_name == 'description':
                    if self.logged_in_permissions(project).has_edit_project_detail:
                        project.description = new_value
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                project.save()
            
            data = {'status': 'success'}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['project']

            project = Project.objects.create(
                created_by=request.user,
                name=params['name'])

            project.create_default_statuses()
            ProjectPermissions.ensure_user_belongs_to_business(user=request.user,
                                                               business=project) #sic
            ProjectPermissions.give_all_permissions_to_user(user=request.user, business=project) #sic

            context['project'] = {'name': project.name}
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['POST'])
    def invite(self, request, pk):
        try:
            project_id = pk
            project = self.allowed_project(project_id)
            invited_user_email = request.data['user_email']
            invited_user, created_user = User.objects.get_or_create(email=invited_user_email,
                                                                    defaults={'username':invited_user_email})

            if self.logged_in_permissions(project).has_invite_users:
                ProjectPermissions.ensure_user_belongs_to_business(user=invited_user,
                                                                    business=project) #sic

                project_invite, created_invite = ProjectInvite.objects.get_or_create(business=project, #sic
                                                                                     user=invited_user,
                                                                                     defaults={'invited_by':request.user})


                if created_invite or project_invite.invite_sent_at is None:
                    self._send_invite(project, invited_user, created_user)
                    project_invite.invite_sent_at = timezone.now()
                    project_invite.save()

                data = {'status': 'success'}
            else:
                data = {'status': 'failed', 'error_message': 'Permission denied to invite users'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def _send_invite(self, project, invite_user, created_user ):

        if created_user:
            content = """
            
            You have been invited to join ImpTime, on the project {PROJECT_NAME}

            Click the link to set a password and join the team.

            {PROJECT_LINK}

            """
        else:
            content = """

            You have been added to: {PROJECT_NAME}

            Click the link to login and view your new project.

            {PROJECT_LINK}

            """

        auto_login_token = UserAutoLoginToken.get_auto_login_token(invite_user)
            
        content = content.format(PROJECT_NAME=project.name,
                                 PROJECT_LINK=settings.WEB_URL_BASE + "projects/%d" % project.id + "?autologin="+auto_login_token)

        queue_email(subject_content="ImpTime: Join project %s" % project.name,
                    from_address=settings.FROM_EMAIL,
                    text_content=content,
                    html_content=content.replace("\n","<br/>"),
                    to_addresses=[invite_user.email])

    def delete(self, request, pk):
        try:
            params = request.data
            data = None
            if 'item_ids' in params:
                project_pks = params['item_ids']
            else:
                project_pks = [pk]
            for project_pk in project_pks:
                project = self.allowed_project(project_pk)                
                issues = Issue.objects.filter(project__business=project)
                
                if self.logged_in_permissions(project).can_delete_project:
                    BusinessHistory.add_history(request.user, project,
                                             "deleted", project.id, "")
                    if len(issues) > 0:
                        for issue in issues:
                             issue.visual_spec_issues.all().delete()
                    project.visual_spec_projects.all().delete()
                    project.deadline_types.all().delete()
                    project.delete()                    
                else:
                    data = {'status': 'failed', 'error_message': 'Permission denied to delete projects'}

            if not data:
                data = {'status': 'success', 'payload': project_pks}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
