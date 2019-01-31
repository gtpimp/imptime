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

                can_view_billable_amount = self.logged_in_permissions(project) is not None and self.logged_in_permissions(project).can_view_ctc_billable_rates
                can_view_velocity = self.logged_in_permissions(project) is not None and self.logged_in_permissions(project).can_view_velocity
                can_view_time_tracking_mode = can_view_velocity
                can_view_commission = can_view_billable_amount and self.logged_in_permissions(project) is not None and self.logged_in_permissions(project).can_view_budget
            else:
                can_view_billable_amount = False
                can_view_velocity = False
                can_view_time_tracking_mode = can_view_velocity
                can_view_commission = False

            if 'sprint_id' in filter_args and 'user_id' in filter_args and surs.count() == 0:
                # We return an empty sprint rate so that the caller can tell what's going on.
                sprint = self.allowed_sprint(filter_args['sprint_id'])
                user = self.allowed_user(filter_args['user_id'])
                bp = ProjectPermissions.for_user(user=user, business=sprint.business, auto_create=False)
                if bp is not None and bp.is_active_member_of_business:
                    surs = [Rate.objects.get_or_create(project_id=sprint.id, #sic
                                                       user_id=user.id)[0]]
                    
            else:
                surs = self.apply_pagination(qs=surs, pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in surs.values_list('id', flat=True)]
            else:
                s = SprintUserRateSerializer(surs, many=True,
                                             can_view_billable_amount=can_view_billable_amount,
                                             can_view_velocity=can_view_velocity,
                                             can_view_time_tracking_mode = can_view_time_tracking_mode,
                                             can_view_commission = can_view_commission)
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

                can_edit_billable_amount = self.logged_in_permissions(project) is not None and self.logged_in_permissions(project).can_edit_ctc_billable_rates
                can_edit_velocity = self.logged_in_permissions(project) is not None and self.logged_in_permissions(project).can_edit_velocity
                can_edit_time_tracking_mode = can_edit_velocity
                
                for user_pk in user_pks:
                    user = self.allowed_user(user_pk)
                    try:
                        rate = Rate.objects.get_or_create(user=user, project=sprint)[0] #sic
                    except Rate.MultipleObjectsReturned:
                        Rate.objects.filter(user=user, project=sprint).delete()
                        rate = Rate.objects.create(user=user, project=sprint)[0] #sic

                    if 'billable_amount' in rate_values and can_edit_billable_amount:
                        try:
                            rate.billable_amount = float(rate_values['billable_amount'])
                        except ValueError:
                            rate.billable_amount = 0
                        rate.save()
                    if 'velocity' in rate_values and can_edit_velocity:
                        try:
                            rate.velocity = float(rate_values['velocity'])
                        except ValueError:
                            rate.velocity = 0
                        rate.save()
                    if 'time_tracking_mode' in rate_values and can_edit_time_tracking_mode:
                        rate.time_tracking_mode = rate_values['time_tracking_mode']
                        rate.save()
                        
                sprint.recalc_secondary_estimates()
                        
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
            
        sprint_ids = filter_args.pop('sprint_ids', [])
        if len(sprint_ids)>0:
            filter_args['sprint_id__in'] = sprint_ids

        user_ids = filter_args.pop('user_ids', [])
        if len(user_ids)>0:
            filter_args['user_id__in'] = user_ids
            
        return super(SprintUserRateViewSet, self).apply_filter(qs, filter_args)
        
