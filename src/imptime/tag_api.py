import logging
from .tag_serializer import TagSerializer
from rest_framework.decorators import detail_route, list_route
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from .base_api import BaseViewSet
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
                s = TagSerializer(tags, many=True)
                tags_data = s.data
                context['tags'] = tags_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
            
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            tag_id = params['tag_id']
            name = params['name'].lower()
            category_name = params['category_name'].lower()

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
        
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

    @list_route(methods=['PUT'])
    def add_to_issue(self, request):
        try:
            context = {}
            params = request.data
            issue_ids = request.data['issue_ids']
            tag_id = request.data.get('tag_id', None)
            name = params.get('tag_name', None)
            category_name = params.get('tag_category_name', None)
            
            if tag_id is None and (name is None or category_name is None):
                raise Exception("One or other of tag_id or name must not be empty")
            
            issues = self.allowed_issues().filter(pk__in=issue_ids)

            if not self.logged_in_permissions(issues[0].project.business).has_edit_tags:
                raise Exception("Can't create tags")

            if tag_id is not None:
                tag = self.allowed_tags().filter(pk=tag_id).order_by("-id").first()
                if name is not None:
                    name = name.lower()
                    tag.name = name
                    tag.save()
                if category_name is not None:
                    category_name = category_name.lower()
                    tag_category = tag.category
                    tag_category.name = category_name
                    tag_category.save()
            else:
                tag_category = TagCategory.objects.get_or_create(business=issues[0].project.business,
                                                                 name=category_name.lower())[0]
                tag = Tag.objects.get_or_create(category=tag_category,
                                                name=name.lower())[0]

            for issue in issues:
                if issue.tags.filter(pk=tag.id).count() == 0:
                    issue.tags.add(tag)
                    issue.save()
            
            context['tag'] = TagSerializer(tag).data
            data = {'status': 'success', 'payload': { 'item': context }}
            return HttpResponse(JSONRenderer().render(data))

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

    @detail_route(methods=['DELETE'])
    def remove_from_issues(self, request, pk):
        try:
            tag_id = pk
            params = request.data
            issue_ids = params['issue_ids']
            issues = self.allowed_issues().filter(pk__in=issue_ids)
            if not self.logged_in_permissions(issues[0].project.business).has_edit_tags:
                raise Exception("Can't delete tags")

            tag = self.allowed_tags().filter(pk=tag_id).order_by("-id").first()

            for issue in issues:
                if issue.tags.filter(pk=tag.id).count() > 0:
                    issue.tags.remove(tag)
                    issue.save()

            if tag.issues.count() == 0:
                tag.delete()

            if tag.category.tags.count() == 0:
                tag.category.delete()
                
            data = {'status': 'success'}
            return HttpResponse(JSONRenderer().render(data))
        
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

    def apply_filter(self, qs, raw_filter_args):
        project_id = raw_filter_args.pop('project_id', None)
        if project_id:
            qs = qs.filter(category__business_id=project_id) #sic
        return super(TagViewSet, self).apply_filter(qs, raw_filter_args)
    
