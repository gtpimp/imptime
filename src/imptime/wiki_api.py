import logging
from wiki_serializer import WikiPageSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
from django.db.models import Prefetch, Count, Sum
import json
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from imptime.models import ProjectWiki, WikiPage
from rest_framework.decorators import detail_route

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class WikiViewSet(BaseViewSet):

    def list(self, request):

        try:
            context = {}

            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            wiki_pages = self.allowed_wiki_pages()
            wiki_pages = self.apply_filter(qs=wiki_pages, raw_filter_args=filter_args)

            wiki_pages = self.apply_pagination(qs=wiki_pages,
                                               pagination=pagination)
            
            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in wiki_pages.values_list('id', flat=True)]
            else:
                s = WikiPageSerializer(wiki_pages, many=True)
                wiki_pages_data = s.data
                context['wikis'] = wiki_pages_data
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

            if 'wiki_page_ids' in params:
                wiki_page_pks = params['wiki_page_ids']
            else:
                wiki_page_pks = [pk]

            for wiki_page_pk in wiki_page_pks:
                wiki_page = self.allowed_wiki_page.get(pk=wiki_page_pk)
                if not self.logged_in_permissions(wiki_page.project).has_edit_business_comments:
                    raise Exception("No permission to edit this wiki page")
                
                if field_name == 'name':
                    wiki_page.name = new_value
                elif field_name == "money_sensitive":
                    if self.logged_in_permissions(wiki_page.project).has_view_ctc_billable_rates:
                        wiki_page.money_sensitive = new_value
                elif field_name == "content":
                    wiki_page.content = content
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                wiki_page.save()

            data = {'status': 'success'}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['item']
            project_id = params['project_id']
            default_wiki_page_args = params.get('default_wiki_page_args', {})
            fixed_default_wiki_page_args = self._apply_business_project_switch(default_wiki_page_args)
            project = self.allowed_project(project_id)

            if self.logged_in_permissions(project).has_edit_business_comments:
                wiki_page = WikiPage.objects.create(
                    name=params['name'],
                    **fixed_default_wiki_page_args)
                ProjectWiki.objects.create(project=project, wiki_page=wiki_page)

                context['item'] = WikiPageSerializer(wiki_page).data
                data = {'status': 'success', 'payload': context}
            else:
                data = {'status': 'failed', 'error_message': 'Permission denied to create wiki page'}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def apply_filter(self, qs, raw_filter_args):
        raw_filter_args['__business_project_switch_filter_required'] = False

        project_id = raw_filter_args.pop('project_id', None)
        if project_id is not None:
            raw_filter_args['project_wikis__project_id'] = project_id
        return super(WikiViewSet, self).apply_filter(qs,  raw_filter_args)
    
