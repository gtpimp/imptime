import logging
from company_user_permission_serializer import CompanyUserPermissionSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import CompanyPermissions

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class CompanyUserPermissionViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            cups = self.allowed_company_permissions()
            cups = self.apply_filter(qs=cups, raw_filter_args=filter_args)

            if 'company_id' not in filter_args:
                # this is because of a limitation in the implementation
                # of allowed_company_permissions, could be fixed.
                raise Exception("Must filter by company")

            if cups.count() > 0:
                company = cups[0].company #sic
                if self.logged_in_company_permissions(company) is None or not self.logged_in_company_permissions(company).has_set_user_permissions:
                    cups = cups.none()

            if 'company_id' in filter_args and 'user_id' in filter_args and cups.count() == 0:
                # We return an empty company permission so that the caller can tell what's going on.
                cups = [CompanyPermissions(business_id=filter_args['company_id'],
                                           user_id=filter_args['user_id'],
                                           id="not_allowed")]
            else:
                cups = self.apply_pagination(qs=cups, pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in cups.values_list('id', flat=True)]
            else:
                s = CompanyUserPermissionSerializer(cups, many=True)
                cups_data = s.data
                context['company_user_permissions'] = cups_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            params = request.data
            company_pk = params['company_id']
            user_pks = params['user_ids']
            permission_values = params['permission_values']

            company = self.allowed_company(company_pk)

            if self.logged_in_company_permissions(company) is None or not self.logged_in_company_permissions(company).has_set_user_permissions:
                data = {'status': 'failure', 'payload': {'error_msg':'No permissions to perform this action'}}
            else:
                for user_pk in user_pks:
                    user = self.allowed_user(user_pk)
                    cup = CompanyPermissions.for_user(user, company)

                    for permission_name, value in permission_values.items():
                        cup.update_permission(permission_name, value, save=False)
                    cup.save()
                data = {'status': 'success', 'payload': {}}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
