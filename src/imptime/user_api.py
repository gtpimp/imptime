import logging
from user_serializer import UserSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
# from timepiece.models import Business as User
# from timepiece.models import User as Sprint

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class UserViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            users = self.allowed_users().order_by("username")
            users = self.apply_filter(qs=users, raw_filter_args=filter_args)
            users = self.apply_pagination(qs=users, pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in users.values_list('id', flat=True)]
            else:
                s = UserSerializer(users, many=True, logged_in_user=request.user)
                users_data = s.data
                context['users'] = users_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def apply_filter(self, qs, raw_filter_args):
        project_id = raw_filter_args.pop("project_id", None)
        if project_id:
            qs = qs.filter(business_permissions__business_id=project_id, #sic
                           business_permissions__is_active_member_of_business=True).distinct()

        return super(UserViewSet, self).apply_filter(qs, raw_filter_args)
