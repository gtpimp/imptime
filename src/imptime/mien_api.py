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
from imptime.models import Mien
from imptime.mien_serializer import MienSerializer

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

            miens = self.allowed_miens().order_by("order", "id")
            miens = self.apply_filter(qs=miens, raw_filter_args=filter_args)

            miens = self.apply_pagination(qs=miens,
                                             pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in miens.values_list(
                    'id', flat=True)]
            else:
                s = MienSerializer(miens, many=True)
                miens_data = s.data
                context['miens'] = miens_data
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

            if 'mien_ids' in params:
                mien_pks = params['mien_ids']
            else:
                mien_pks = [pk]

            for mien_pk in mien_pks:
                mien = self.allowed_miens().get(pk=mien_pk)
                if field_name == 'title':
                    mien.title = new_value
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                mien.save()
            
            data = {'status': 'success'}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['item']

            mien = Mien.objects.create(user=request.user,
                                       title=params['title'])

            context['item'] = MienSerializer(mien).data
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
                mien_pks = params['item_ids']
            else:
                mien_pks = [pk]
            for mien_pk in mien_pks:
                mien = self.allowed_miens().get(pk=mien_pk)
                mien.delete()

            if not data:
                data = {'status': 'success', 'payload': mien_pks}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
