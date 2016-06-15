import logging
from base_serializer import BaseModelSerializer
#from base_serializer import BaseModelListSerializer
from timepiece.models import Business as Project
logger = logging.getLogger(__name__)


class ProjectSerializer(BaseModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'name')


# class ProjectListSerializer(BaseModelListSerializer):
#     projects = s.ListField(ProjectSerializer())
