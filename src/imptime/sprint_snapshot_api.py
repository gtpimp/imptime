import logging
from project_serializer import ProjectSerializer
from django.db.models import Case, When
from rest_framework.decorators import detail_route
from django import template
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
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
                s = SprintSnapshotSerializer(sprint_snapshots, many=True)
                sprint_snapshots_data = s.data
                context['sprint_snapshots'] = sprint_snapshots_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
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
                elif field_name == 'feature':
                    features = json.loads(sprint_snapshot.features or "[]")
                    feature_name = new_value['feature_name']
                    is_enabled = new_value['is_enabled']
                    if not is_enabled and feature_name in features:
                        features.remove(feature_name)
                    elif is_enabled and feature_name not in features:
                        features.append(feature_name)
                    sprint_snapshot.features = json.dumps(features)
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                sprint_snapshot.save()

            context = {}
            context['items'] = SprintSnapshotSerializer(self.allowed_sprint_snapshots().filter(pk__in=sprint_snapshot_pks),
                                              many=True).data
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['item']

            clone_of_sprint_snapshot_id = params.get("clone_of_sprint_snapshot_id", None)
            if clone_of_sprint_snapshot_id:
                sprint_snapshot = self.allowed_sprint_snapshots().get(pk=clone_of_sprint_snapshot_id)
                sprint_snapshot.id = None
                sprint_snapshot.description = params['description']
                sprint_snapshot.save()
            else:
                sprint_snapshot = SprintSnapshot.objects.create(user=request.user,
                                        description=params['description'])

            context['item'] = SprintSnapshotSerializer(sprint_snapshot).data
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
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

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
