import logging
from issue_serializer import IssueSerializer
from django.conf import settings
from django.core.files import File as DjangoFile
import os
from django_downloadview import HTTPDownloadView
from django.contrib.auth.decorators import login_required
from visual_spec_document_serializer import VisualSpecDocumentSerializer
from rest_framework.decorators import detail_route
from rest_framework.renderers import JSONRenderer
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Count, Sum, Q, Prefetch
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from timepiece.models import IssueHistory, Issue
from timepiece.models import ProjectIssueOrder as SprintIssueOrder
from imptime.models import VisualSpecDocument, VisualSpecProject
from imptime.models import VisualSpecIssue, VisualSpecFeature, VisualSpecWiki

logger = logging.getLogger(__name__)


@permission_classes((IsAuthenticated,))
class VisualSpecDocumentViewSet(BaseViewSet):

    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            visual_spec_documents = self.allowed_visual_spec_documents()
            visual_spec_documents = self.apply_filter(qs=visual_spec_documents,
                                                      raw_filter_args=filter_args)
            visual_spec_documents = self.apply_pagination(qs=visual_spec_documents,
                                                          pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in visual_spec_documents.values_list(
                    'id', flat=True)]
            else:

                for vsd in visual_spec_documents:
                    vsd.download_url = VisualSpecDocumentSerializer.get_download_url(self.request, vsd)
                    vsd.hires_url = VisualSpecDocumentSerializer.get_hires_url(self.request, vsd)
                    vsd.medium_res_url = VisualSpecDocumentSerializer.get_medium_res_url(self.request, vsd)
                    vsd.preview_url = VisualSpecDocumentSerializer.get_preview_url(self.request, vsd)
                s = VisualSpecDocumentSerializer(visual_spec_documents, many=True)
                visual_spec_documents_data = s.data
                context['visual_spec_documents'] = visual_spec_documents_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            project_pk = request.POST['project_id']
            project = self.allowed_project(project_pk)
            issue_pk = request.POST.get('issue_id', None)
            feature_pk = request.POST.get('feature_id', None)
            wiki_pk = request.POST.get('wiki_id', None)

            issue = self.allowed_issue(issue_pk) if issue_pk else None
            feature = self.allowed_feature(feature_pk) if feature_pk else None
            wiki = self.allowed_wiki_pages().get(pk=wiki_pk) if wiki_pk else None
                
            for name, f in request.FILES.items():                
                VisualSpecDocument.create_for_doc(user=request.user,
                                                  project=project,
                                                  doc=f,
                                                  name=f.name,
                                                  content_type=f.content_type,
                                                  issue=issue,
                                                  feature=feature,
                                                  wiki=wiki)
                
            data = {'status': 'success'}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def update(self, request, pk):
        try:
            params = request.data
            field_name = params['field_name']
            new_value = params['value']
            project_id = params.get('project_id')
            issue_id = params.get('issue_id', None)
            feature_id = params.get('feature_id', None)
            wiki_id = params.get('wiki_id', None)

            annotated_visual_spec_document_ids = params.pop('annotated_visual_spec_document_ids', [pk])

            for annotated_vsd_id in annotated_visual_spec_document_ids:
                annotated_vsd = self.allowed_annotated_visual_spec_documents().get(pk=annotated_vsd_id)

                if field_name == 'annotated_visual_spec_document_id_after':
                    annotated_after_vsd = self.allowed_annotated_visual_spec_documents().get(pk=new_value)
                    if issue_id is not None:
                        VisualSpecIssue.insert_after(issue_id, annotated_vsd, annotated_after_vsd)
                        issue = self.allowed_issue(issue_id)
                        issue.save()
                    elif feature_id is not None:
                        VisualSpecFeature.insert_after(feature_id, annotated_vsd, annotated_after_vsd)
                        feature = self.allowed_feature(feature_id)
                        feature.save()
                    elif wiki_id is not None:
                        VisualSpecWiki.insert_after(wiki_id, annotated_vsd, annotated_after_vsd)
                        wiki = self.allowed_wiki_pages().get(pk=wiki_id)
                        wiki.save()
                    else:
                        VisualSpecProject.insert_after(project_id, annotated_vsd, annotated_after_vsd)
                        project = self.allowed_project(project_id)
                        project.save()
                else:
                    raise Exception("Unsupported field name: %s" % field_name)

            data = {'status': 'success', 'payload': annotated_visual_spec_document_ids}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
