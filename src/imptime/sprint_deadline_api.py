import logging
from rest_framework.decorators import detail_route
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Project as Sprint
from timepiece.models import ProjectDeadline as SprintDeadline
from timepiece.models import ProjectDeadlineType as SprintDeadlineType
from sprint_deadline_serializer import SprintDeadlineModelSerializer, SprintDeadlineSerializer

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class SprintDeadlineViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            sprint_deadlines = self.allowed_sprint_deadlines()
            sprint_deadlines = sprint_deadlines.order_by("deadline")
            sprint_deadlines = self.apply_filter(qs=sprint_deadlines,
                                                 raw_filter_args=filter_args)
            sprint_deadlines = self.apply_pagination(qs=sprint_deadlines,
                                                     pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in sprint_deadlines.values_list('id', flat=True)]
            else:
                s = SprintDeadlineSerializer(sprint_deadlines, many=True)
                sprint_deadlines_data = s.data
                context['sprint_deadlines'] = sprint_deadlines_data
                context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
                
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
    
    def create(self, request):
        try:
            params = request.data
            deadline_data = self.fix_deadline_data_from_params(params['item'])
            sprint_pk = deadline_data['sprint_id']
            sprint = self.allowed_sprint(sprint_pk)
            if not self.logged_in_permissions(sprint.business).has_edit_deadlines:
                raise Exception("Permission denied")
            
            s = SprintDeadlineModelSerializer(data=deadline_data)
            s.is_valid(raise_exception=True)
            deadline = s.save()
            sprint.save()
            
            data = {'status': 'success',
                    'payload': { 'item': { 'deadline': SprintDeadlineSerializer(deadline).data}}}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            deadline_data = self.fix_deadline_data_from_params(params['value'])
            sprint_pk = deadline_data['sprint_id']
            deadline_id = pk

            sprint = self.allowed_sprint(sprint_pk)
            deadline = SprintDeadline.objects.filter(project=sprint).get(pk=deadline_id)

            if not self.logged_in_permissions(sprint.business).has_edit_deadlines:
                raise Exception("Permission denied")
            
            s = SprintDeadlineModelSerializer(data=deadline_data, instance=deadline)
            s.is_valid(raise_exception=True)
            deadline = s.save()
            sprint.save()
            
            data = {'status': 'success',
                    'payload': SprintDeadlineSerializer(deadline).data}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def delete(self, request, pk):
        try:
            deadline_id = pk
            deadline = self.allowed_sprint_deadlines().get(pk=deadline_id)
            sprint = deadline.project #sic

            if not self.logged_in_permissions(sprint.business).has_edit_deadlines:
                raise Exception("Permission denied")
            
            deadline.delete()
            sprint.save()
            data = {'status': 'success'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def fix_deadline_data_from_params(self, deadline_data):
        sprint_id = deadline_data['sprint_id']
        business_id = Sprint.objects.filter(pk=sprint_id).values_list('business_id', flat=True)[0]
        deadline_data['project'] = sprint_id
        deadline_data['represents_project_start'] = deadline_data.pop('represents_sprint_start', False) or False
        deadline_data['represents_project_end'] = deadline_data.pop('represents_sprint_end', False) or False
        deadline_data['is_hard_deadline'] = deadline_data.pop('is_hard_deadline', False) or False

        deadline_data['deadline_type'] = SprintDeadlineType.objects.get(business_id=business_id, #sic
                                                                        pk=deadline_data.pop('deadline_type_id', deadline_data.pop('deadline_type', None))).id

        return deadline_data

    def apply_filter(self, qs, raw_filter_args):
        project_id = raw_filter_args.pop('project_id', None)
        if project_id:
            qs = qs.filter(project__business_id=project_id) #sic
            
        sprint_status = raw_filter_args.pop('sprint_status', None)
        if sprint_status == 'open':
            qs = qs.filter(project__status3__is_closed=False)
            
        sprint_types = raw_filter_args.pop('sprint_types', None)
        if sprint_types is not None:
            qs = qs.filter(project__project_type__in=sprint_types)
            
        return super(SprintDeadlineViewSet, self).apply_filter(qs, raw_filter_args)
