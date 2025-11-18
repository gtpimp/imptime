import logging
from .project_serializer import ProjectSerializer
from django.db.models import Case, When
from rest_framework.decorators import detail_route
from django import template
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from .base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from imptime.models import SprintSnapshot
from imptime.sprint_snapshot_serializer import SprintSnapshotSerializer

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class SprintSnapshotViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}

            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            sprint_snapshots = self.allowed_sprint_snapshots()

            sprint_snapshots = sprint_snapshots.order_by("-created", "id")
            sprint_snapshots = self.apply_filter(qs=sprint_snapshots, raw_filter_args=filter_args)
            sprint_snapshots = self.apply_pagination(qs=sprint_snapshots, pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in sprint_snapshots.values_list('id', flat=True)]
            else:
                s = SprintSnapshotSerializer(sprint_snapshots, many=True, logged_in_user=request.user)
                sprint_snapshots_data = s.data
                context['sprint_snapshots'] = sprint_snapshots_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            field_name = params['field_name']
            new_value = params['value']

            if 'sprint_snapshot_ids' in params:
                sprint_snapshot_pks = params['sprint_snapshot_ids']
            else:
                sprint_snapshot_pks = [pk]

            for sprint_snapshot_pk in sprint_snapshot_pks:
                sprint_snapshot = self.allowed_sprint_snapshots().get(pk=sprint_snapshot_pk)
                if field_name == 'description':
                    sprint_snapshot.description = new_value
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                sprint_snapshot.save()

            context = {}
            context['items'] = SprintSnapshotSerializer(self.allowed_sprint_snapshots().filter(pk__in=sprint_snapshot_pks),
                                                        many=True,
                                                        logged_in_user=request.user).data
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['item']
            sprint_id = params['sprint_id']
            sprint = self.allowed_sprints().get(pk=sprint_id)
            sprint_snapshot = SprintSnapshot.create_snapshot(description=params['description'],
                                                             sprint_id=sprint.id,
                                                             user=request.user)
            context['item'] = SprintSnapshotSerializer(sprint_snapshot, logged_in_user=request.user).data
            data = {'status': 'success', 'payload': context}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def delete(self, request, pk):
        try:
            params = request.data
            data = None
            if 'item_ids' in params:
                sprint_snapshot_pks = params['item_ids']
            else:
                sprint_snapshot_pks = [pk]
            for sprint_snapshot_pk in sprint_snapshot_pks:
                sprint_snapshot = self.allowed_sprint_snapshots().get(pk=sprint_snapshot_pk)
                sprint_snapshot.delete()

            if not data:
                data = {'status': 'success', 'payload': sprint_snapshot_pks}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def apply_filter(self, qs, raw_filter_args):
        sprint_id = raw_filter_args.pop('sprint_id', None)
        if sprint_id:
            qs = qs.filter(sprint_id=sprint_id)
        return super(SprintSnapshotViewSet, self).apply_filter(qs, raw_filter_args)
