import logging
from base_serializer import BaseModelSerializer
from timepiece.models import Project as Sprint
logger = logging.getLogger(__name__)


class SprintSerializer(BaseModelSerializer):
    class Meta:
        model = Sprint
        fields = ('id', 'name')


# class SprintListSerializer(BaseModelListSerializer):
#     sprints = s.ListField(SprintSerializer())
