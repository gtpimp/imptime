import logging
from release_note_serializer import ReleaseNoteSerializer
from rest_framework.decorators import list_route
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from imptime.models import ReleaseNote, ReleaseNoteSeen

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class ReleaseNoteViewSet(BaseViewSet):

    @list_route(methods=['GET'])
    def unseen_list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            format_args = params.get('format', {})

            release_notes = self.allowed_release_notes()\
                                .order_by("created")\
                                .exclude(release_notes_seen_by=request.user)
            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in release_notes.values_list(
                    'id', flat=True)]
            else:
                s = ReleaseNoteSerializer(release_notes,
                                      logged_in_user=self.request.user,
                                      many=True)
                release_notes_data = s.data
                context['release_notes'] = release_notes_data
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    @list_route(methods=['POST'])
    def mark_seen(self, request):
        try:
            params = request.data
            release_note_ids = params['release_note_ids']

            for release_note_id in release_note_ids:
                release_note = self.allowed_release_notes().get(pk=release_note_id)
                ReleaseNoteSeen.get_or_create(seen_by=request.user, release_note=release_note)
                
            data = {'status': 'success'}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
            
    
    def list(self, request):
        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            release_notes = self.allowed_release_notes()
            release_notes = self.apply_filter(qs=release_notes,
                                         raw_filter_args=filter_args)
            release_notes = self.apply_pagination(qs=release_notes,
                                             pagination=pagination)

            if format_args.get('ids_only'):
                context['ids'] = [str(x) for x in release_notes.values_list('id', flat=True)]
            else:
                s = ReleaseNoteSerializer(release_notes, many=True)
                release_notes_data = s.data
                context['release_notes'] = release_notes_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def apply_filter(self, qs, raw_filter_args):
        unseen = raw_filter_args.pop('unseen', None)
        if unseen == True:
            qs = qs.exclude(release_notes_seen_by=self.request.user)
        return super(ReleaseNoteViewSet, self).apply_filter(qs, raw_filter_args)
    
    def update(self, request, pk):
        try:
            params = request.data
            release_note_id = params['release_note_id']
            header = params['header']
            content = params['content']

            if not request.user.is_superuser:
                raise Exception("Can't update release notes")
            
            release_note = self.allowed_release_notes().get(pk=release_note_id)
            release_note.header = header
            release_note.content = content
            release_note.save()
            
            data = {'status': 'success'}
        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):
        try:
            context = {}
            params = request.data['release_note']

            if not request.user.is_superuser:
                raise Exception("Can't create release notes")
            
            release_note = ReleaseNote.objects.create(
                created_by=request.user,
                header=params['header'],
                content=params['content'])

            context['release_note'] = ReleaseNoteSerializer(release_note)
            data = {'status': 'success', 'payload': context}

        except Exception, ex:
            logger.exception(ex)
            return self.error_response(ex)
        
        return HttpResponse(JSONRenderer().render(data))
