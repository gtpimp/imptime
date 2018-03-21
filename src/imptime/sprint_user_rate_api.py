import logging
from sprint_user_rate_serializer import SprintUserRateSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from timepiece.models import Project as Sprint
from timepiece.models import User, Rate
from timepiece.models import BusinessPermissions as ProjectPermissions
from django.db.transaction import atomic

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class SprintUserRateViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            surs = self.allowed_sprint_rates()
            surs = self.apply_filter(qs=surs, filter_args=filter_args)

            if surs.count() > 0:
                sprint = surs[0].project #sic
                project = sprint.business #sic
                if self.logged_in_permissions(project) is None or not self.logged_in_permissions(project).can_view_ctc_billable_rates:
                    surs = surs.none()

            if 'sprint_id' in filter_args and 'user_id' in filter_args and surs.count() == 0:
                # We return an empty sprint rate so that the caller can tell what's going on.
                surs = [Rate(project_id=filter_args['sprint_id'],
                             user_id=filter_args['user_id'],
                             id="not_allowed")]
            else:
                surs = self.apply_pagination(qs=surs, pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in surs.values_list('id', flat=True)]
            else:
                s = SprintUserRateSerializer(surs, many=True)
                surs_data = s.data
                context['sprint_user_rates'] = surs_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    @atomic
    def create(self, request):
        """ also used for update """
        try:
            params = request.data
            sprint_pks = params['sprint_ids']
            user_pks = params['user_ids']
            rate_values = params['rate_values']

            for sprint_pk in sprint_pks:
                sprint = self.allowed_sprint(sprint_pk)
                project = sprint.business #sic

                if self.logged_in_permissions(project) is None or not self.logged_in_permissions(project).can_edit_ctc_billable_rates:
                    data = {'status': 'failure', 'payload': {'error_msg':'No permissions to perform this action'}}
                    break
                else:
                    for user_pk in user_pks:
                        user = self.allowed_user(user_pk)
                        rate = Rate.objects.get_or_create(user=user, project=sprint)[0] #sic
                        rate.billable_amount = rate_values['billable_amount']
                        rate.save()
                        
            data = {'status': 'success', 'payload': {}}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
    
    def apply_filter(self, qs, filter_args):
        ids = filter_args.pop('ids', [])
        if len(ids)>0:
            sprint_ids = []
            user_ids = []
            for id in ids:
                sprint_id, user_id = id.split("_")
                sprint_ids.append(sprint_id)
                user_ids.append(user_id)
            filter_args['sprint_id__in'] = sprint_ids
            filter_args['user_id__in'] = user_ids
            
        return super(SprintUserRateViewSet, self).apply_filter(qs, filter_args)
        
