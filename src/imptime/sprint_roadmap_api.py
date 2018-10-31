import logging
from sprint_roadmap_serializer import SprintRoadmapSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Project as Sprint
from timepiece.models import Business as Project

logger = logging.getLogger(__name__)

# Sprints are weird: They use the timepiece.Project model for legacy
# reasons. This api renames the model to Sprint in the import, but
# functions on the model will still refer to project. This is noted
# with 'sic' where it could be surprising.

@permission_classes((IsAuthenticated,))
class SprintRoadmapViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            sprints = self.allowed_sprints()
            sprints = self.apply_filter(qs=sprints,
                                        raw_filter_args=filter_args)
            sprints = self.apply_pagination(qs=sprints,
                                            pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in sprints.values_list(
                    'id', flat=True)]
            else:
                sprints = sprints.select_related("status3")
                sprints = self._enrich_qs(sprints)
                s = SprintRoadmapSerializer(sprints, many=True, logged_in_user=request.user)
                sprints_data = s.data
                context['sprint_roadmaps'] = sprints_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def _enrich_qs(self, qs):
        qs = qs.annotate(num_issues=Count('issues'))\
               .prefetch_related('issues__implements_testables__features')
        return qs
    
    def apply_filter(self, qs, raw_filter_args):
        project_id = raw_filter_args.pop('project_id', None)
        if project_id:
            qs = qs.filter(business_id=project_id) #sic
            
        sprint_status = raw_filter_args.pop('sprint_status', None)
        if sprint_status == 'open':
            raw_filter_args['status3__name__in'] = Sprint.open_states()
            
        sprint_types = raw_filter_args.pop('sprint_types', None)
        if sprint_types is not None:
            qs = qs.filter(project_type__in=sprint_types)
            
        return super(SprintRoadmapViewSet, self).apply_filter(qs, raw_filter_args)
    
