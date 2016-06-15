import logging
from base_serializer import BaseModelSerializer
from timepiece.models import Issue
logger = logging.getLogger(__name__)


class IssueSerializer(BaseModelSerializer):
    class Meta:
        model = Issue
        fields = ('id', 'number', 'status', 'subject', 'description',
                  'feature', 'created', 'modified', 'adhoc')


# class IssueListSerializer(BaseModelListSerializer):
#     issues = s.ListField(IssueSerializer())
