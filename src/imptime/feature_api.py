import logging
from feature_serializer import FeatureSerializer
from markdown_enrichment import MarkdownEnrichment
from project_api import ProjectViewSet
from django.utils import timezone
from lib import hours_helper
from imptime.bulk_text_parser import BulkTextParser
from rest_framework.decorators import list_route, detail_route
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Prefetch
from django.db.models import Count, Sum, Q
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from imptime.models import Feature, FeatureHistory, ProjectFeatureOrder
from timepiece.models import Business as Project
from timepiece.models import BusinessPermissions as ProjectPermissions

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class FeatureViewSet(BaseViewSet):

    def list(self, request):

        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            features = self.allowed_features()
            features = self.apply_filter(qs=features, raw_filter_args=filter_args)

            features = self.apply_pagination(qs=features, pagination=pagination)

            if format_args.get('ids_only', None):
                context['ids'] = [str(x) for x in features.values_list(
                    'id', flat=True)]
            else:
                features = self._enrich_features_qs(features)
                s = FeatureSerializer(features, logged_in_user=request.user, many=True)
                features_data = s.data
                context['features'] = features_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))

    def _enrich_features_qs(self, features):
        features = features.prefetch_related('children')
        return features

    def update(self, request, pk):
        try:
            params = request.data
            field_name = params['field_name']
            new_value = params.get('value', None)

            if 'item_ids' in params:
                feature_pks = params['item_ids']
                feature_pks = feature_pks

                if field_name == 'feature_id_after':
                    # need to reverse sort because of how the function works
                    feature_pks = feature_pks.reverse()
                
            else:
                feature_pks = [pk]

            for feature_pk in feature_pks:
                feature = self.allowed_feature(feature_pk)

                if field_name == "name":
                    if self.logged_in_permissions(feature.project).has_edit_feature:
                        old_name = feature.name
                        feature.name = new_value
                        FeatureHistory.add_history(
                            request.user, feature, "changed name",
                            old_name, feature.name)
                elif field_name == "description":
                    if self.logged_in_permissions(feature.project).has_edit_feature:
                        old_description = feature.description
                        feature.description = new_value
                        feature.enriched_description = MarkdownEnrichment(request.user).enrich(feature.description,
                                                                                               project_id=feature.project_id) #sic
                        FeatureHistory.add_history(
                            request.user, feature, "changed description",
                            old_description, feature.description)
                        
                elif field_name == 'parent_feature_id':
                    if self.logged_in_permissions(feature.project).has_edit_feature:
                        new_parent = self.allowed_feature(field_name)
                        FeatureHistory.add_history(
                            request.user, feature, "moved feature",
                            feature.parent.name, new_parent.name)

                elif field_name == 'feature_id_after':
                    if self.logged_in_permissions(feature.project).has_edit_features:
                        if new_value is None:
                            ProjectFeatureOrder.insert_at_the_beginning(feature)
                        else:
                            after_feature = self.allowed_feature(new_value)
                            ProjectFeatureOrder.insert_after(feature, set_after_this_feature=after_feature)
                        
                else: 
                    raise Exception("Unsupported field name: %s" % field_name)
                feature.save()

            data = {'status': 'success', 'payload': feature_pks}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):

        try:
            context = {}
            params = request.data['item']
            project_id = params['project_id']
            parent_feature_id = params.get('parent_feature_id', None)

            project = self.allowed_project(project_id)
            if not self.logged_in_permissions(project).has_edit_feature:
                raise Exception('Permission denied to create features')

            def create_feature():

                if parent_feature_id is not None:
                    feature_parent = self.allowed_feature(parent_feature_id)
                    if feature_parent.project_id != project_id:
                        raise Exception("Parent must belong to the same project")
                else:
                    feature_parent = None
                
                feature = Feature.objects.create(project_id=project_id,
                                                 name=params['name'],
                                                 number=Feature.get_next_feature_number(project),
                                                 parent=feature_parent,
                                                 created=request.user)

                FeatureHistory.add_history(request.user, feature,
                                           "created", "", feature.name)
                return feature

            feature = create_feature()
            feature = self._enrich_features_qs(Feature.objects.filter(pk=feature.id)).first()
            context['item'] = FeatureSerializer(feature, logged_in_user=request.user).data
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        res = HttpResponse(JSONRenderer().render(data))
        return res

    @list_route(methods=['POST'])
    def bulk_create_features(self, request):
        try:
            params = request.data
            project_id = params['project_id']
            bulk_feature_text = params['bulk_feature_text']
            project = self.allowed_project(project_id)
            if not self.logged_in_permissions(project).has_add_feature:
                raise Exception("Can't add features")
            new_features = BulkTextParser(request.user).create_features(raw_text=bulk_feature_text, project=project)
            new_feature_ids = [ str(x.id) for x in new_features ]
            data = {'status': 'success', 'payload': {'new_feature_ids': new_feature_ids}}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def delete(self, request, pk):
        try:
            params = request.data
            data = None

            if 'item_ids' in params:
                feature_pks = params['item_ids']
            else:
                feature_pks = [pk]

            for feature_pk in feature_pks:
                feature = self.allowed_feature(feature_pk)
                if self.logged_in_permissions(feature.project).has_edit_feature:
                    FeatureHistory.add_history(request.user, feature,
                                               "deleted", feature.name, "")
                    feature.delete()
                else:
                    data = {'status': 'failed', 'error_message': 'Permission denied to delete features'}

            if not data:
                data = {'status': 'success', 'payload': feature_pks}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def apply_filter(self, qs, raw_filter_args):
        raw_filter_args['__business_project_switch_filter_required'] = False        
        feature_any_field = raw_filter_args.pop('any_field', None)
        if feature_any_field is not None and len(feature_any_field)>1:
            qs = qs.filter(Q(name__icontains=feature_any_field)|Q(description__icontains=feature_any_field))

        return super(FeatureViewSet, self).apply_filter(qs=qs, raw_filter_args=raw_filter_args)
