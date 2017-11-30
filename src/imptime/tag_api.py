import logging
from tag_serializer import TagSerializer
from rest_framework.decorators import detail_route, list_route
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import Tag, TagCategory

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class TagViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            tags = self.allowed_tags()
            tags.order_by("category__name", "name")
            tags = self.apply_filter(qs=tags,
                                     raw_filter_args=filter_args)
            tags = self.apply_pagination(qs=tags,
                                         pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in tags.values_list('id', flat=True)]
            else:
                s = TagSerializer(tags, many=True, logged_in_user=request.user)
                tags_data = s.data
                context['tags'] = tags_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            tag_id = params['tag_id']
            name = params['name']
            category_name = params['category_name']

            tag = self.allowed_tags().get(pk=tag_id)
            issue = tag.issues.all()[0]
            if self.logged_in_permissions(issue.project.business).has_edit_tags:
                raise Exception("Can't create tags")
            
            if tag.name != name:
                tag.name = name
                tag.save()

            tag_category = tag.category
            if tag_category.name != category_name:
                tag_category.name = category_name
                tag_category.save()
            
            data = {'status': 'success'}
            return HttpResponse(JSONRenderer().render(data))
        
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

    @list_route(methods=['PUT'])
    def add_to_issue(self, request):
        try:
            context = {}
            params = request.data['item']
            issue_ids = request.data['issue_ids']
            name = params['name']
            category_name = params['category_name']
            issues = self.allowed_issues().filter(pk__in=issue_ids)

            if self.logged_in_permissions(issues[0].project.business).has_edit_tags:
                raise Exception("Can't create tags")

            tag_category = TagCategory.get_or_create(business=issues[0].project,
                                                     name=category_name)[0]
            tag = Tag.objects.get_or_create(category=tag_category,
                                            name=name)[0]

            for issue in issues:
                issue.tags.add(tag)
                issue.save()
            
            context['tag'] = TagSerializer(tag).data
            data = {'status': 'success', 'payload': { 'item': context }}
            return HttpResponse(JSONRenderer().render(data))

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

    @detail_route(methods=['DELETE'])
    def remove_from_issues(self, request, pk):
        try:
            tag_id = pk
            params = request.data['item']
            issue_ids = params.data['issue_ids']
            issues = self.allowed_issues().filter(pk__in=issue_ids)
            if self.logged_in_permissions(issues[0].project.business).has_edit_tags:
                raise Exception("Can't delete tags")

            tag = self.allowed_tags().get(pk=tag_id)

            for issue in issues:
                issue.tags.remove(tag)
                issue.save()

            if tag.issues.count() == 0:
                tag.delete()

            if tag.category.tags.count() == 0:
                tag.category.delete()
                
            data = {'status': 'success'}
            return HttpResponse(JSONRenderer().render(data))
        
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
