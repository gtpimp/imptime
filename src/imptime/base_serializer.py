from rest_framework import serializers as s
# from django.conf import settings
from rest_framework.renderers import JSONRenderer
import logging
logger = logging.getLogger(__name__)


class BaseModelSerializer(s.ModelSerializer):
    pass


class BaseSerializer(s.Serializer):
    @classmethod
    def json(self):
        data = self.validated_data
        return JSONRenderer().render(data)


# class PaginationSerializer(BaseSerializer):

#     min_page_num = s.IntegerField(required=False, default=1)
#     max_page_num = s.IntegerField(required=False, default=1)
#     current_page_num = s.IntegerField(required=False, default=1)
#     page_size = s.IntegerField(required=False,
#                                default=settings.PAGINATION_DEFAULT_PAGINATION)
#     total_num_items = s.IntegerField(required=False, default=0)
#     showing_from_items = s.IntegerField(required=False, default=0)
#     showing_to_items = s.IntegerField(required=False, default=0)

#     def to_internal_value(self, data):
#         return super(PaginationSerializer, self).to_internal_value(data)
