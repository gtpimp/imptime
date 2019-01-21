import logging
from feature_serializer import FeatureSerializer
from collections import defaultdict
import copy
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
from imptime.models import Feature, FeatureHistory, ProjectFeatureOrder, VisualSpecIssue
from timepiece.models import IssueHistory
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

            project_id = filter_args.get('project_id', None)
            if project_id:
                Feature.ensure_root_feature_exists(project_id)
                
            features = self.allowed_features()
            features = self.apply_filter(qs=features, raw_filter_args=filter_args)

            if project_id:
                features = features.order_by_project_id(project_id=project_id,
                                                        parent_feature_id=None)
             
            features = self.apply_pagination(qs=features, pagination=pagination)

            if format_args.get('ids_only', None):
                if not project_id:
                    raise Exception("Must filter by project_id") # for the moment, this is just a sanity check
                context['ids'] = [str(x) for x in features.values_list(
                    'id', flat=True)]
            else:
                if features.count() > 0:
                    project_id = features[0].project_id
                    features = self._enrich_features_qs(features, project_id)

                features = self._calculate_feature_stats(request.user, features)
                    
                s = FeatureSerializer(features, logged_in_user=request.user, many=True)
                features_data = s.data
                context['features'] = features_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))

    def _enrich_features_qs(self, features, project_id):
        features = features.prefetch_related('children')\
                           .prefetch_related('project_feature_orders')\
                           .prefetch_related('issues')\
                           .prefetch_related('testables')\
                           .prefetch_related('testables__implementing_issues')\
                           .prefetch_related('testables__implementing_issues__testables')\
                           .prefetch_related('testables__implementing_issues__entries')\
                           .prefetch_related('testables__implementing_issues__issue_points')\
                           .prefetch_related('testables__implementing_issues__project__rate')\
                           .prefetch_related('testables__testable_steps')\
                           .prefetch_related('visual_spec_features')
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

                        if feature.is_root:
                            raise Exception("Can't edit root feature name")
                        
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

                elif field_name == 'position':
                    if self.logged_in_permissions(feature.project).has_edit_feature:
                        new_parent_id = new_value['parent_id']
                        new_sibling_node_before_id = new_value['sibling_node_before_id']

                        if new_parent_id is None:
                            new_parent_id = Feature.get_root_feature(feature.project).id
                            
                        if new_parent_id != feature.parent_id:
                            if new_parent_id is None:
                                new_parent = Feature.get_root_feature(feature.project)
                            else:
                                new_parent = self.allowed_feature(new_parent_id)
                            FeatureHistory.add_history(
                                request.user, feature, "updated parent",
                                feature.parent.name if feature.parent else "root", new_parent.name)
                            feature.parent_id = new_parent.id

                        if new_sibling_node_before_id is None:
                            FeatureHistory.add_history(
                                request.user, feature, "moved",
                                None, "to top")
                            ProjectFeatureOrder.insert_at_the_beginning(feature)
                        else:
                            new_sibling_node_before = self.allowed_feature(new_sibling_node_before_id)
                            FeatureHistory.add_history(
                                request.user, feature, "moved",
                                None, "after %s" % new_sibling_node_before.name)
                            ProjectFeatureOrder.insert_after(feature, new_sibling_node_before)

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
                    if feature_parent.project_id != project.id:
                        raise Exception("Parent must belong to the same project")
                else:
                    feature_parent = Feature.get_root_feature(project)
                
                feature = Feature.objects.create(project_id=project_id,
                                                 name=params['name'],
                                                 number=Feature.get_next_feature_number(project),
                                                 parent=feature_parent,
                                                 created=request.user)

                FeatureHistory.add_history(request.user, feature,
                                           "created", "", feature.name)
                return feature

            feature = create_feature()
            feature = self._enrich_features_qs(Feature.objects.filter(pk=feature.id), project).first()

            self._calculate_feature_stats(request.user, [feature])
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
            auto_create_issues = params.get('auto_create_issues', False)
            project = self.allowed_project(project_id)
            if not self.logged_in_permissions(project).has_edit_feature:
                raise Exception("Can't add features")
            new_features = BulkTextParser(request.user).create_features(raw_text=bulk_feature_text, project=project,
                                                                        auto_create_issues_for_leaf_nodes=auto_create_issues)
            new_feature_ids = [ str(x.id) for x in new_features ]
            data = {'status': 'success', 'payload': {'new_feature_ids': new_feature_ids}}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    @list_route(methods=['POST'])
    def auto_create_issues_from_features(self, request):
        try:
            params = request.data
            project_id = params['project_id']
            project = self.allowed_project(project_id)
            features = project.features.all()
            BulkTextParser(request.user).auto_create_issues_for_leaf_features(project, features)
            data = {'status': 'success'}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
            
    @detail_route(methods=['PUT'])
    def addIssueToFeatureTestable(self, request, pk):
        try:
            params = request.data
            feature_id = params['feature_id']
            testable_id = params['testable_id']
            issue_id = params['issue_id']

            issue = self.allowed_issue(issue_id)
            project = issue.project.business #sic
            if not self.logged_in_permissions(project).has_edit_issue_feature:
                raise Exception("Can't edit issue features")
            
            feature = self.allowed_feature(feature_id)
            feature.link_issue_to_testable(request.user, issue_id, testable_id)
            data = {'status': 'success'}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['PUT'])
    def addIssueToFeatureTestableAutoCreate(self, request, pk):
        try:
            params = request.data
            feature_id = params['feature_id']
            issue_id = params['issue_id']
            feature = self.allowed_feature(feature_id)

            issue = self.allowed_issue(issue_id)
            project = issue.project.business #sic
            if not self.logged_in_permissions(project).has_edit_issue_feature:
                raise Exception("Can't edit issue features")

            for issue_testable in issue.testables.all():
                feature.link_feature_to_issue_testable(request.user, issue_testable)
            data = {'status': 'success'}
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))


    @detail_route(methods=['PUT'])
    def removeIssueFromFeatureTestable(self, request, pk):
        try:
            params = request.data
            feature_id = params['feature_id']
            testable_id = params['testable_id']
            issue_id = params['issue_id']

            issue = self.allowed_issue(issue_id)
            project = issue.project.business #sic
            if not self.logged_in_permissions(project).has_edit_issue_feature:
                raise Exception("Can't edit issue features")
            
            feature = self.allowed_feature(feature_id)
            feature.unlink_issue_from_testable(request.user, testable_id, issue_id)
            data = {'status': 'success'}
            
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

    @classmethod
    def _calculate_feature_stats(self, logged_in_user, features):
        for feature in features:
            feature.stats = self._calculate_issue_stats(logged_in_user, feature)

        features_by_id = dict( [(x.id, x) for x in features] )

        for feature in features:
            self._recursively_calculate_nested_stats(logged_in_user, features_by_id, feature)

        return features

    @classmethod
    def _recursively_calculate_nested_stats(self, logged_in_user, features_by_id, feature):
        if hasattr(feature, "nested_stats"):
            return
        
        nested_stats = copy.deepcopy(feature.stats)
        feature.nested_stats = nested_stats

        for child_id in [x.id for x in feature.children.all()]:
            child = features_by_id.get(child_id, None)
            if not child:
                # happens when refreshing just part of the feature set
                child = feature.children.get(pk=child_id)
                child.stats = self._calculate_issue_stats(logged_in_user, child)
                features_by_id[child_id] = child
            if not hasattr(child, "nested_stats"):
                self._recursively_calculate_nested_stats(logged_in_user, features_by_id, child)
            for k, v in child.nested_stats.items():
                nested_stats[k] += v


    @classmethod
    def _calculate_issue_stats(self, logged_in_user, feature):

        stats = defaultdict(float)
        testables = feature.testables.all()
        stats['num_testables'] = len(testables)

        missing_testable = len(testables) == 0 and len(feature.children.all()) == 0
        stats['num_features_missing_testables'] = 1 if missing_testable else 0
        
        for feature_testable in testables:
            issues = feature_testable.implementing_issues.all()
            if len(issues) == 0:
                stats['num_testables_without_issues'] += 1
            else:
                stats['num_testables_with_issues'] += 1
            stats['num_issues'] += len(issues)

            fully_implemented_testable = False
            for issue in issues:

                if not hasattr(self, "_cached_permissions"):
                    # pick the first issue as representative of all permissions
                    self._cached_permissions = ProjectPermissions.for_user(user=logged_in_user,
                                                                           business=issue.project.business_id,
                                                                           auto_create=False)
                    
                
                rates = issue.project.rate.all()
                rate = [ x for x in rates if x.user_id == issue.assigned_to_id ]
                if len(rates) > 0:
                    rate = rates[0]
                    velocity = rate.velocity
                else:
                    velocity = 1.0
                
                points = [ x for x in issue.issue_points.all() if x.user_id == issue.assigned_to_id ]
                if len(points) == 0:
                    stats['num_issues_without_estimates'] += 1
                else:
                    estimate = points[0].points
                    stats['num_issues_with_estimates'] += 1

                    if issue.assigned_to_id == logged_in_user.id or self._cached_permissions.has_see_other_user_points:
                        stats['estimated_hours'] += (estimate or 0) * velocity

                if self._cached_permissions.has_view_actual_hours:
                    for entry in issue.entries.all():
                        stats['hours_clocked'] += float(entry.hours)

                issue_testables = issue.testables.all()
                for issue_testable in issue_testables:
                    if issue_testable.steps == feature_testable.steps:
                        fully_implemented_testable = True
                    
            if fully_implemented_testable:
                stats['num_fully_implemented_testables'] += 1
            else:
                stats['num_not_fully_implemented_testables'] += 1
                
        return stats
            
    
