import logging
from project_serializer import ProjectSerializer
from django.db.models import Case, When, Q
from rest_framework.decorators import detail_route
from django import template
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
from timepiece.models import Project as Sprint
from timepiece.models import ProjectStatus as SprintStatus
from timepiece.models import ProjectIssueOrder as SprintIssueOrder
from timepiece.models import BusinessHistory
from timepiece.models import Issue, IssueStatus
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

            self.auto_accept_invites(projects)
            
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

    def auto_accept_invites(self, projects):
        for invite in ProjectInvite.objects.filter(business__in=projects,
                                                   accepted=False,
                                                   user=self.request.user):
            invite.accepted=True
            invite.accepted_at=timezone.now()
            invite.save()
    
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
            self.create_inbox_sprint(project)
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

            if self.logged_in_permissions(project).has_invite_users:
                invited_user = User.objects.filter(email=invited_user_email).first()
                if invited_user is None:
                    invited_user = User.objects.create(email=invited_user_email,
                                                       username=invited_user_email)
                    created_user = True
                else:
                    created_user = False

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
            html_template = template.loader.get_template("imptime/emails/project_invite_new_user.html")
            plain_template = template.loader.get_template("imptime/emails/project_invite_new_user.txt")
        else:
            html_template = template.loader.get_template("imptime/emails/project_invite_existing_user.html")
            plain_template = template.loader.get_template("imptime/emails/project_invite_existing_user.txt")

        auto_login_token = UserAutoLoginToken.get_auto_login_token(invite_user)

        email_context = { 'project_name': project.name,
                          'login_link': settings.WEB_URL_BASE + "projects/%d" % project.id + "?autologin="+auto_login_token }
        html_content = html_template.render(email_context)
        plain_content = plain_template.render(email_context)

        queue_email(subject_content="ImpTime: Join project %s" % project.name,
                    from_address=settings.FROM_EMAIL,
                    text_content=plain_content,
                    html_content=html_content,
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

    @classmethod
    def auto_create_self_project(self, user):
        project = Project.objects.filter(name='me', created_by=user).first()

        if project is None:
            is_new = True
            project = Project.objects.create(name='me',
                                             created_by=user,
                                             description='My personal project for whatever I want. (and I am %s)' % user.email)
        else:
            is_new = False
        
        if is_new:
            ProjectPermissions.ensure_user_belongs_to_business(user=user,
                                                               business=project) #sic
            ProjectPermissions.give_all_permissions_to_user(user=user, business=project) #sic
            project.create_default_statuses()
            sprint = Sprint.objects.get_or_create(name='Sprint1 - ' + timezone.now().strftime("%b %Y"),
                                                  business=project, #sic
                                                  status3=SprintStatus.objects.get(business=project, name='pending'),
                                                  description="Things to do this month")[0]
            issue = Issue.objects.get_or_create(project=sprint,
                                                subject="Offload all the things that worry me",
                                                auto_created_during_import=False,
                                                issue_type='issue',
                                                status2=IssueStatus.objects.get_or_create(name='new', business=project)[0],
                                                assigned_to=user,
                                                defaults={'number':Issue.get_next_issue_number(project),
                                                          'description':"The best way to feel relaxed is to create an issue for everything thing you have on your mind",
                                                          'created':timezone.now(),
                                                          'modified':timezone.now()})[0]
            self.create_inbox_sprint(project)
            SprintIssueOrder.insert_at_the_end(issue)

    @classmethod
    def create_inbox_sprint(self, project):
        inbox_description = """For incoming unprocessed issues. 

You can add issues here normally, or by emailing %s@%s""" % (project.inbox_email_name(), "imptime.com")
        
        return Sprint.objects.get_or_create(name=settings.ISSUE_INBOX_DEFAULT_SPRINT_NAME,
                                            business=project, #sic
                                            project_type="inbox", #sic
                                            defaults={'status3':SprintStatus.objects.get(business=project, name='pending'),
                                                      'description':inbox_description})[0]
    def apply_filter(self, qs, raw_filter_args):
        any_field = raw_filter_args.pop('any_field', None)
        if any_field:
            qs = qs.filter(Q(name__icontains=any_field)|Q(description__icontains=any_field)|Q(email__icontains=any_field))
        return super(ProjectViewSet, self).apply_filter(qs, raw_filter_args)
