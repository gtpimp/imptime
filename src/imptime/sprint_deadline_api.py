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
from sprint_deadline_serializer import SprintDeadlineModelSerializer, SprintDeadlineSerializer

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class SprintDeadlineViewSet(BaseViewSet):

    def create(self, request):
        try:
            params = request.data
            sprint_pk = params['sprint_id']
            sprint = self.allowed_sprint(sprint_pk)
            if not self.logged_in_permissions(sprint.business).has_edit_deadlines:
                raise Exception("Permission denied")
            
            s = SprintDeadlineModelSerializer(data=params)
            s.is_valid(raise_exception=True)
            deadline = s.save()
            sprint.save()
            
            data = {'status': 'success',
                    'payload': SprintDeadlineSerializer(deadline).data}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            sprint_pk = params['sprint_id']
            deadline_id = params['deadline_id']

            sprint = self.allowed_sprint(sprint_pk)
            deadline = SprintDeadline.objects.filter(project=sprint).get(pk=deadline_id)

            if not self.logged_in_permissions(sprint.business).has_edit_deadlines:
                raise Exception("Permission denied")
            
            s = SprintDeadlineModelSerializer(data=params, instance=deadline)
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
            params = request.data
            sprint_pk = params['sprint_id']
            deadline_id = params['deadline_id']
            sprint = self.allowed_sprint(sprint_pk)

            if not self.logged_in_permissions(sprint.business).has_edit_deadlines:
                raise Exception("Permission denied")
            
            deadline = SprintDeadline.objects.filter(sprint=sprint).get(pk=deadline_id)
            deadline.delete()
            sprint.save()
            data = {'status': 'success'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
