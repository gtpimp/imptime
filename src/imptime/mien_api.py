import logging
from project_serializer import ProjectSerializer
from django.db.models import Case, When
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
from imptime.models import Mien, MienHeader
from imptime.mien_serializer import MienSerializer, MienHeaderSerializer

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class MienViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}

            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            miens = self.allowed_miens()

            if miens.count() == 0:
                Mien.create_default_mien(user=request.user)
                miens = self.allowed_miens()

            miens = miens.order_by("order", "id")
            miens = self.apply_filter(qs=miens, raw_filter_args=filter_args)
            miens = self.apply_pagination(qs=miens, pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in miens.values_list(
                    'id', flat=True)]
            else:
                s = MienSerializer(miens, many=True)
                miens_data = s.data
                context['miens'] = miens_data
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

            if 'mien_ids' in params:
                mien_pks = params['mien_ids']
            else:
                mien_pks = [pk]

            for mien_pk in mien_pks:
                mien = self.allowed_miens().get(pk=mien_pk)
                if field_name == 'title':
                    mien.title = new_value
                elif field_name == 'headers':
                    header_name = new_value['name']
                    headers = new_value['headers']
                    mien_header = MienHeader.objects.get_or_create(mien=mien, name=header_name)[0]
                    mien_header.headers = json.dumps(MienHeaderSerializer(headers, many=True).data)
                    mien_header.save()
                elif field_name == 'feature':
                    features = json.loads(mien.features or "[]")
                    feature_name = new_value['feature_name']
                    is_enabled = new_value['is_enabled']
                    if not is_enabled and feature_name in features:
                        features.remove(feature_name)
                    elif is_enabled and feature_name not in features:
                        features.append(feature_name)
                    mien.features = json.dumps(features)
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                mien.save()

            context = {}
            context['items'] = MienSerializer(self.allowed_miens().filter(pk__in=mien_pks),
                                              many=True).data
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['item']

            clone_of_mien_id = params.get("clone_of_mien_id", None)
            if clone_of_mien_id:
                mien = self.allowed_miens().get(pk=clone_of_mien_id)
                mien.id = None
                mien.title = params['title']
                mien.save()
            else:
                mien = Mien.objects.create(user=request.user,
                                        title=params['title'])

            context['item'] = MienSerializer(mien).data
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
                mien_pks = params['item_ids']
            else:
                mien_pks = [pk]
            for mien_pk in mien_pks:
                mien = self.allowed_miens().get(pk=mien_pk)
                mien.delete()

            if not data:
                data = {'status': 'success', 'payload': mien_pks}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
