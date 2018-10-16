import logging
from rest_framework import serializers
from base_serializer import BaseSerializer
logger = logging.getLogger(__name__)

class DecisionJournalSerializer(BaseSerializer):

    id = serializers.CharField()
    description = serializers.CharField()
    reason = serializers.CharField()
    context = serializers.CharField()
    repercussions = serializers.FloatField()
    decision_made_at = serializers.DateTimeField()
    decision_made_by_id = serializers.CharField()
    project_id = serializers.CharField()
    
    def __init__(self, *args, **kwargs):
        self.logged_in_user = kwargs.pop('logged_in_user')
        return super(DecisionJournalSerializer, self).__init__(*args, **kwargs)
