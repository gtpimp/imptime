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
from timepiece.models import ProjectReview as SprintReview
from sprint_review_serializer import SprintReviewSerializer, SprintReviewInboundSerializer
logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class SprintReviewViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            sprint_reviews = self.allowed_sprint_reviews()
            sprint_reviews = sprint_reviews.order_by("review_by__username")
            sprint_reviews = self.apply_filter(qs=sprint_reviews,
                                                 raw_filter_args=filter_args)
            sprint_reviews = self.apply_pagination(qs=sprint_reviews,
                                                     pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in sprint_reviews.values_list('id', flat=True)]
            else:
                s = SprintReviewSerializer(sprint_reviews, many=True)
                sprint_reviews_data = s.data
                context['sprint_reviews'] = sprint_reviews_data
                context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
                
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
    
    def create(self, request):
        try:
            params = request.data
            review_data = self.fix_review_data_from_params(params['item'])
            sprint_pk = review_data['sprint_id']
            sprint = self.allowed_sprint(sprint_pk)
            if not self.logged_in_permissions(sprint.business).has_edit_review_cycle:
                raise Exception("Permission denied")

            s = SprintReviewInboundSerializer(data=review_data)
            s.is_valid(raise_exception=True)
            review = s.save()
            sprint.save()
            
            data = {'status': 'success',
                    'payload': { 'item': { 'review': SprintReviewSerializer(review).data}}}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            review_data = self.fix_review_data_from_params(params['value'])
            sprint_pk = review_data['sprint_id']
            review_id = pk

            sprint = self.allowed_sprint(sprint_pk)
            review = SprintReview.objects.filter(project=sprint).get(pk=review_id)

            if not self.logged_in_permissions(sprint.business).has_edit_review_cycle:
                raise Exception("Permission denied")
            
            s = SprintReviewInboundSerializer(data=review_data, instance=review)
            s.is_valid(raise_exception=True)
            review = s.save()
            sprint.save()
            
            data = {'status': 'success',
                    'payload': SprintReviewSerializer(review).data}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def delete(self, request, pk):
        try:
            review_id = pk
            review = self.allowed_sprint_reviews().get(pk=review_id)
            sprint = review.project #sic

            if not self.logged_in_permissions(sprint.business).has_edit_review_cycle:
                raise Exception("Permission denied")
            
            review.delete()
            sprint.save()
            data = {'status': 'success'}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def fix_review_data_from_params(self, review_data):
        sprint_id = review_data['sprint_id']
        review_data['project'] = review_data['sprint_id']
        review_data['review_by'] = review_data.pop('review_by_id')
        review_data['must_always_review'] = review_data.get('must_always_review', False) or False
        return review_data

    def apply_filter(self, qs, raw_filter_args):
        project_id = raw_filter_args.pop('project_id', None)
        if project_id:
            qs = qs.filter(project__business_id=project_id) #sic
        return super(SprintReviewViewSet, self).apply_filter(qs, raw_filter_args)
