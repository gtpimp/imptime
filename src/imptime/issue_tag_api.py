import logging
from issue_serializer import IssueSerializer
from issue_serializer import IssueGeneralDetailsSerializer
from issue_serializer import IssueWithEstimatesSerializer
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
from timepiece.models import Issue, IssueHistory, Feature
from timepiece.models import TagCategory, Tag, Entry

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class IssueTagViewSet(BaseViewSet):

    def create(self, request):
        try:
            params = request.data
            tag_category_name = params['tag_category_name']
            tag_name = params['tag_name']
            issue_pks = params['issue_ids']

            for issue_pk in issue_pks:
                issue = self.allowed_issue(issue_pk)
                tag_category = TagCategory.objects.get_or_create(business=issue.project.business,
                                                                 name=tag_category_name)[0]
                tag = Tag.objects.get_or_create(category=tag_category, name=tag_name)[0]
                issue.tags.add(tag)
                issue.save()
            data = {'status': 'success'}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
            
        return HttpResponse(JSONRenderer().render(data))
    
    def delete(self, request):
        try:
            params = request.data
            tag_category_name = params['tag_category_name']
            tag_name = params['tag_name']
            issue_pks = params['issue_ids']

            for issue_pk in issue_pks:
                issue = self.allowed_issue(issue_pk)
                tag_category = TagCategory.objects.get_or_create(business=issue.project.business,
                                                                 name=tag_category_name)[0]
                tag = Tag.objects.get_or_create(category=tag_category, name=tag_name)[0]
                issue.tags.remove(tag)
                issue.save()
                
            data = {'status': 'success'}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

