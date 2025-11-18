import logging
from .wiki_serializer import WikiPageSerializer
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from .base_api import BaseViewSet
from .markdown_enrichment import MarkdownEnrichment
from django.db.models import Prefetch, Count, Sum
import json
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Business as Project
from imptime.models import WikiPage, WikiPageHistory, ProjectWikiOrder
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

            wiki_pages = wiki_pages.order_by("name")
            
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
        except Exception as ex:
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
                wiki_page = self.allowed_wiki_pages().get(pk=wiki_page_pk)
                if not self.logged_in_permissions(wiki_page.project).has_edit_business_comments:
                    raise Exception("No permission to edit this wiki page")
                
                if field_name == 'name':
                    old_value = wiki_page.name
                    wiki_page.name = new_value
                    WikiPageHistory.add_history(request.user, wiki_page, "update name", old_value, new_value)
                elif field_name == "money_sensitive":
                    if self.logged_in_permissions(wiki_page.project).has_view_ctc_billable_rates:
                        old_value = wiki_page.money_sensitive
                        wiki_page.money_sensitive = new_value
                        WikiPageHistory.add_history(request.user, wiki_page, "update money_sensitive", old_value, new_value)
                elif field_name == "store_encrypted":
                    old_value = wiki_page.store_encrypted
                    wiki_page.store_encrypted = new_value
                    WikiPageHistory.add_history(request.user, wiki_page, "update store encrypted", old_value, new_value)
                elif field_name == "content":
                    old_value = wiki_page.content
                    wiki_page.content = new_value
                    wiki_page.enriched_content = MarkdownEnrichment(request.user).enrich(wiki_page.content,
                                                                                         project_id=wiki_page.project_id)
                    WikiPageHistory.add_history(request.user, wiki_page, "update content", old_value, new_value)
                elif field_name == "position":
                    new_parent_id = new_value['parent_id']
                    new_sibling_node_before_id = new_value['sibling_node_before_id']
                    if new_parent_id != wiki_page.parent_id:
                        new_parent = self.allowed_wiki_pages().get(pk=new_parent_id) if new_parent_id else None
                        new_parent_name = new_parent.name if new_parent else "root"
                        wiki_page.parent = new_parent
                        WikiPageHistory.add_history(request.user, wiki_page, "update parent",
                                                    wiki_page.parent.name if wiki_page.parent else "root",
                                                    new_parent_name)
                    if new_sibling_node_before_id is None:
                        WikiPageHistory.add_history(request.user, wiki_page, "moved", None, "to top")
                        ProjectWikiOrder.insert_at_the_beginning(wiki_page)
                    else:
                        new_sibling_node_before = self.allowed_wiki_pages().get(pk=new_sibling_node_before_id)
                        WikiPageHistory.add_history(request.user, wiki_page, "moved", None, "after %s" % new_sibling_node_before.name)
                        ProjectWikiOrder.insert_after(wiki_page, new_sibling_node_before)
                    
                else:
                    raise Exception("Unsupported field name: %s" % field_name)
                wiki_page.save()

            data = {'status': 'success', 'payload': wiki_page_pks}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['item']
            project_id = params['project_id']
            parent_wiki_id = params.get('parent_wiki_id')
            default_wiki_page_args = params.get('default_wiki_page_args', {})
            fixed_default_wiki_page_args = self._apply_business_project_switch(default_wiki_page_args)
            project = self.allowed_project(project_id)

            if self.logged_in_permissions(project).has_edit_business_comments:
                wiki_page = WikiPage.objects.create(
                    name=params['name'],
                    project_id=project.id,
                    parent_id=parent_wiki_id,
                    **fixed_default_wiki_page_args)

                context['item'] = WikiPageSerializer(wiki_page).data
                data = {'status': 'success', 'payload': context}
            else:
                data = {'status': 'failed', 'error_message': 'Permission denied to create wiki page'}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def apply_filter(self, qs, raw_filter_args):
        raw_filter_args['__business_project_switch_filter_required'] = False
        return super(WikiViewSet, self).apply_filter(qs,  raw_filter_args)
    

    def delete(self, request, pk):
        try:
            params = request.data
            data = None

            if 'item_ids' in params:
                wiki_pks = params['item_ids']
            else:
                wiki_pks = [pk]

            for wiki_pk in wiki_pks:
                wiki = self.allowed_wiki_pages().get(pk=wiki_pk)
                if self.logged_in_permissions(wiki.project).can_edit_description:
                    wiki.delete()
                else:
                    data = {'status': 'failed', 'error_message': 'Permission denied to delete wikis'}

            if not data:
                data = {'status': 'success', 'payload': wiki_pks}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
