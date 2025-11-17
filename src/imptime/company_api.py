import logging
from company_serializer import CompanySerializer
from rest_framework.decorators import detail_route
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from .base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Company, CompanyPermissions, CompanyHistory

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class CompanyViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}

            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            companies = self.allowed_companies().order_by("name")
            companies = self.apply_filter(qs=companies,
                                         raw_filter_args=filter_args)


            companies = self.apply_pagination(qs=companies,
                                              pagination=pagination)
            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in companies.values_list(
                    'id', flat=True)]
            else:
                s = CompanySerializer(companies,
                                      logged_in_user=self.request.user,
                                      many=True)
                companies_data = s.data
                context['items'] = companies_data
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

            if 'company_ids' in params:
                company_pks = params['company_ids']
            else:
                company_pks = [pk]

            for company_pk in company_pks:
                company = self.allowed_companies().get(pk=company_pk)
                if field_name == 'name':
                    if self.logged_in_company_permissions(company).has_edit_company_info:
                        old_value = company.name
                        company.name = new_value
                        CompanyHistory.add_history(request.user, company, "Changed name", old_value, new_value)
                elif field_name == 'description':
                    if self.logged_in_company_permissions(company).has_edit_company_info:
                        old_value = company.description
                        company.description = new_value
                        CompanyHistory.add_history(request.user, company, "Changed name", old_value, new_value)
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                company.save()
            
            data = {'status': 'success', 'payload': company_pks}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['item']

            company = Company.objects.create(
                created_by=request.user,
                name=params['name'])

            CompanyPermissions.ensure_user_belongs_to_company(user=request.user, company=company)
            CompanyPermissions.give_all_permissions_to_user(user=request.user, company=company)

            context['item'] = CompanySerializer(company, logged_in_user=request.user).data
            data = {'status': 'success', 'payload': context}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['POST'])
    def invite(self, request, pk):
        try:
            company_id = pk
            company = self.allowed_companies().get(pk=company_id)
            invited_user_email = request.data['user_email']

            if self.logged_in_company_permissions(company).has_invite_users:
                invited_user = User.objects.filter(email=invited_user_email).first()
                if invited_user is None:
                    invited_user = User.objects.create(email=invited_user_email,
                                                       username=invited_user_email)

                CompanyPermissions.ensure_user_belongs_to_company(user=invited_user, company=company)
                data = {'status': 'success'}
                company.save()
            else:
                data = {'status': 'failed', 'error_message': 'Permission denied to invite users'}
                
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def delete(self, request, pk):
        try:
            params = request.data
            data = None
            if 'item_ids' in params:
                company_pks = params['item_ids']
            else:
                company_pks = [pk]
            for company_pk in company_pks:
                company = self.allowed_companies().get(pk=company_pk)                
                
                if self.logged_in_company_permissions(company).can_delete_company:
                    CompanyHistory.add_history(request.user, company,
                                               "deleted", company.id, "")
                else:
                    data = {'status': 'failed', 'error_message': 'Permission denied to delete companies'}

            if not data:
                data = {'status': 'success', 'payload': company_pks}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))


    def apply_filter(self, qs, raw_filter_args):
        any_field = raw_filter_args.pop('any_field', None)
        if any_field:
            qs = qs.filter(Q(name__icontains=any_field)|Q(description__icontains=any_field)|Q(email__icontains=any_field))
        return super(CompanyViewSet, self).apply_filter(qs, raw_filter_args)
