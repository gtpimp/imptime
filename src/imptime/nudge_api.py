import logging
from nudge_serializer import NudgeSerializer
from rest_framework.decorators import list_route
import math
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from django.db.models import Count
from django.conf import settings
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from imptime.nudger import Nudger
from imptime.models import UserNudgeOrder, Nudge

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class NudgeViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})
            ordering = params.get('ordering', {})

            nudges = self.allowed_nudges()
            nudges = self.apply_filter(qs=nudges, raw_filter_args=filter_args)
            nudges = self.apply_ordering(qs=nudges, ordering=ordering)
            if format_args.get('spread', None) and format_args.get('ids_only'):
                nudges = self._spread(nudges, pagination.get('page_size', settings.PAGINATION_DEFAULT_PAGINATION))
            nudges = self.apply_pagination(qs=nudges, pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x.id) for x in nudges]
            else:
                nudges = nudges.prefetch_related('issue__status2')
                s = NudgeSerializer(nudges, many=True)
                nudges_data = s.data
                context['nudges'] = nudges_data
            context['pagination'] = pagination
            data = {'status': 'success',
                    'payload': context,
                    'nested_objects': {
                        'project_ids': [x.sprint.business_id for x in nudges],
                        'sprint_ids': [x.sprint_id for x in nudges if x.sprint_id is not None],
                        'issue_ids': [x.issue_id for x in nudges if x.issue_id is not None]
                    }
            }
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            field_name = params['field_name']
            new_value = params.get('value', None)

            if 'item_ids' in params:
                nudge_pks = params['item_ids']
                user_id = self.allowed_nudges_to_edit_by_schedule().filter(pk=nudge_pks[0]).values_list('user_id', flat=True)[0]
                UserNudgeOrder.renumber(user_id)
                nudge_pks = UserNudgeOrder.sort_these_nudge_ids(user_id, set(nudge_pks))

                if field_name == 'nudge_id_after':
                    # need to reverse sort because of how the function works
                    nudge_pks = nudge_pks.reverse()
            else:
                nudge_pks = [pk]

            for nudge_pk in nudge_pks:
                nudge = self.allowed_nudges_to_edit_by_schedule().get(pk=nudge_pk)

                if field_name == 'nudge_id_after':
                    if new_value is None:
                        UserNudgeOrder.insert_at_the_beginning(nudge)
                    else:
                        after_nudge = self.allowed_nudges().get(pk=new_value)
                        UserNudgeOrder.insert_after(nudge, set_after_this_nudge=after_nudge)
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                nudge.save()

            data = {'status': 'success', 'payload': nudge_pks}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
        
    @list_route(methods=['POST'])
    def convertIssuesToNudges(self, request):
        try:
            params = request.data
            schedule_id = params['schedule_id']
            schedule = self.allowed_schedules_to_edit().get(pk=schedule_id)
            issue_ids = params['issue_ids']
            issues = self.allowed_issues().filter(pk__in=issue_ids)
            nudges = []
            for issue in issues:
                nudge, is_new = Nudge.objects.get_or_create(user_id=schedule.owner_id,
                                                            issue=issue,
                                                            sprint_id=issue.project_id,
                                                            defaults={'reason':'manual', # hack alert: this reason is referenced by nudger.py
                                                                      'description': 'Added by %s' % request.user})
                if is_new:
                    UserNudgeOrder.insert_at_the_beginning(nudge)
                nudges.append(NudgeSerializer(nudge).data)
            data = { 'status': 'success',
                     'payload': {'items': nudges} }
            return HttpResponse(JSONRenderer().render(data))
                
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
    
    @list_route(methods=['POST'])
    def recalculate(self, request):
        try:
            Nudger().refresh_all(user=request.user)
            data = {'status': 'success'}
            return HttpResponse(JSONRenderer().render(data))
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        
    def _spread(self, qs, page_size):
        nudge_reasons = [x['reason'] for x in qs.order_by("reason").values("reason").annotate(reasons=Count("reason"))]
        num_per_reason = math.ceil(float(page_size) / (len(nudge_reasons) or 1))
        results = []
        for nudge_reason in nudge_reasons:
            results.extend([x for x in qs.filter(reason=nudge_reason)[:num_per_reason]])
        return results

    def apply_ordering(self, qs, ordering):
        if qs.count() > 0:
            user_id_for_nudge = qs.first().user_id
            qs = qs.order_by_user_id(user_id=user_id_for_nudge)
        return super(NudgeViewSet, self).apply_ordering(qs, ordering)

    def delete(self, request, pk):
        try:
            params = request.data
            data = None

            if 'item_ids' in params:
                nudge_pks = params['item_ids']
            else:
                nudge_pks = [pk]

            nudges = self.allowed_nudges_to_edit_by_schedule().filter(pk__in=nudge_pks)
            for nudge in nudges:
                nudge.delete()

            if not data:
                data = {'status': 'success', 'payload': nudge_pks}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
    
