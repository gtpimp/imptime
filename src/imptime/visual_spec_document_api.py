import logging
from issue_serializer import IssueSerializer
import PIL
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
from imptime.models import VisualSpecDocument, VisualSpecProject, VisualSpecIssue

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
                    vsd.lores_url = VisualSpecDocumentSerializer.get_lores_url(self.request, vsd)
                    vsd.preview_url = VisualSpecDocumentSerializer.get_preview_url(self.request, vsd)
                
                s = VisualSpecDocumentSerializer(visual_spec_documents, many=True)
                visual_spec_documents_data = s.data
                context['visual_spec_documents'] = visual_spec_documents_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
    
    def create(self, request):
        try:
            project_pk = request.POST['project_id']
            project = self.allowed_project(project_pk)
            issue_pk = request.POST.get('issue_id', None)
            issue = self.allowed_issue(issue_pk) if issue_pk else None
            for name, f in request.FILES.items():
                is_image = f.content_type.startswith('image')
                if is_image:
                    width, height = PIL.Image.open(f).size
                    f_image = f
                else:
                    width=None
                    height=None
                    f_image = None
                vsd = VisualSpecDocument.objects.create(original_doc=f,
                                                        hires=f_image,
                                                        lores=f_image,
                                                        hires_width=width,
                                                        hires_height=height,
                                                        thumbnail=f_image,
                                                        name=f.name,
                                                        content_type=f.content_type,
                                                        is_image=is_image)
                VisualSpecProject.objects.create(visual_spec_document = vsd,
                                                 project_id=project.id,
                                                 order=VisualSpecProject.get_next_order(project.id))
                project.save()
                if issue is not None:
                    VisualSpecIssue.objects.create(visual_spec_document = vsd,
                                                   issue=issue,
                                                   order=VisualSpecIssue.get_next_order(issue.id))
                    issue.save()
                    IssueHistory.add_history(request.user, issue, "added visual spec document", "", f.name)
            data = {'status': 'success'}
            
        except Exception, ex:
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

            visual_spec_document_ids = params.pop('visual_spec_document_ids', [pk])

            for vsd_id in visual_spec_document_ids:
                vsd = self.allowed_visual_spec_documents().get(pk=vsd_id) 

                if field_name == 'visual_spec_document_id_after':
                    after_vsd = self.allowed_visual_spec_documents().get(pk=new_value)
                    if issue_id is not None:
                        VisualSpecIssue.insert_after(issue_id, vsd, after_vsd)
                        issue = self.allowed_issue(issue_id)
                        issue.save()
                    else:
                        VisualSpecProject.insert_after(project_id, vsd, after_vsd)
                        project = self.allowed_project(project_id)
                        project.save()
                else:
                    raise Exception("Unsupported field name: %s" % field_name)

            data = {'status': 'success', 'payload': visual_spec_document_ids}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['POST'])
    def associateWithIssue(self, request, pk):
        try:
            params = request.data
            visual_spec_document_id = pk
            issue_id = params['issue_id']
            visual_spec_document_id = self.allowed_visual_spec_documents().get(pk=visual_spec_document_id).id
            issue = self.allowed_issues().get(pk=issue_id)
            issue_id = issue.id
            VisualSpecIssue.insert_at_the_end(issue_id, visual_spec_document_id)
            issue.save()
            data = {'status': 'success', 'payload': [visual_spec_document_id]}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    @detail_route(methods=['POST'])
    def unassociateWithIssue(self, request, pk):
        try:
            params = request.data
            visual_spec_document_id = pk
            issue_id = params['issue_id']
            visual_spec_document_id = self.allowed_visual_spec_documents().get(pk=visual_spec_document_id).id
            issue = self.allowed_issues().get(pk=issue_id)
            issue_id = issue.id
            vsi = VisualSpecIssue.objects.filter(issue_id=issue_id, visual_spec_document_id=visual_spec_document_id).first()
            if vsi is not None:
                vsi.delete()
            issue.save()
            data = {'status': 'success', 'payload': [visual_spec_document_id]}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))
    
    @detail_route(methods=['POST'])
    def unassociateWithProject(self, request, pk):
        try:
            params = request.data
            visual_spec_document_id = pk
            project_id = params['project_id']
            vsd = self.allowed_visual_spec_documents().get(pk=visual_spec_document_id)
            project = self.allowed_projects().get(pk=project_id)
            project_id = project.id
            vsi = VisualSpecProject.objects.filter(project_id=project_id, visual_spec_document_id=visual_spec_document_id).first()
            if vsi is not None:
                vsi.delete()
            vsd.deleted = True
            vsd.save()
            project.save()
            data = {'status': 'success', 'payload': [visual_spec_document_id]}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))


    @detail_route(methods=['POST'])
    def cloneIssueForDoc(self, request, pk):
        try:
            params = request.data
            visual_spec_document_id = pk
            visual_spec_document = self.allowed_visual_spec_documents().get(pk=visual_spec_document_id)
            import pdb; pdb.set_trace()
            issue_id = params['issue_id']
            issue_to_clone = self.allowed_issue(issue_id)
            if not self.logged_in_permissions(issue_to_clone.project.business).has_edit_issues:
                raise Exception("Can't add issues")

            new_issue = Issue.objects.create(
                project_id=issue_to_clone.project_id,   # sic
                status2=issue_to_clone.status2,
                number=Issue.get_next_issue_number(issue_to_clone.project.business),
                subject=issue_to_clone.subject + " (clone)",
                created_by=request.user)

            SprintIssueOrder.insert_after(new_issue, set_after_this_issue=issue_to_clone)
            IssueHistory.add_history(request.user, new_issue,
                                         "created", "", new_issue.number)

            VisualSpecIssue.objects.create(visual_spec_document=visual_spec_document,
                                           issue=new_issue,
                                           order=0)

            data = { 'status': 'success',
                     'payload': { 'new_issue_id': new_issue.id,
                                  'new_visual_spec_document_id': visual_spec_document.id } }
            return HttpResponse(JSONRenderer().render(data))
            
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
    
