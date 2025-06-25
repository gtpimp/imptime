import logging
from django.utils import timezone
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from django.db.models import Q
from base_api import BaseViewSet
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from imptime.models import DecisionJournal, DecisionJournalHistory
from decision_journal_serializer import DecisionJournalSerializer

logger = logging.getLogger(__name__)

@permission_classes((IsAuthenticated,))
class DecisionJournalViewSet(BaseViewSet):

    def list(self, request):

        try:
            context = {}
            params = request.GET.get('params', '{}')
            params = json.loads(params)
            pagination = params.get('pagination', {})
            filter_args = params.get('filter', {})
            format_args = params.get('format', {})

            project_id = filter_args.get('project_id', None)
            decision_journals = self.allowed_decision_journals()
            decision_journals = self.apply_filter(qs=decision_journals, raw_filter_args=filter_args)

            decision_journals = decision_journals.order_by("-decision_made_at")
            decision_journals = self.apply_pagination(qs=decision_journals, pagination=pagination)

            if format_args.get('ids_only', None):
                if not project_id:
                    raise Exception("Must filter by project_id") # for the moment, this is just a sanity check
                context['ids'] = [str(x) for x in decision_journals.values_list(
                    'id', flat=True)]
            else:
                if decision_journals.count() > 0:
                    project_id = decision_journals[0].project_id
                    decision_journals = self._enrich_decision_journals_qs(decision_journals, project_id)

                s = DecisionJournalSerializer(decision_journals, logged_in_user=request.user, many=True)
                decision_journals_data = s.data
                context['items'] = decision_journals_data
            context['pagination'] = pagination
            data = {'status': 'success', 'payload': context}
        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)
        return HttpResponse(JSONRenderer().render(data))

    def _enrich_decision_journals_qs(self, decision_journals, project_id):
        return decision_journals
    
    def update(self, request, pk):
        try:
            params = request.data
            field_name = params['field_name']
            new_value = params.get('value', None)

            if 'item_ids' in params:
                decision_journal_pks = params['item_ids']
                decision_journal_pks = decision_journal_pks

                if field_name == 'decision_journal_id_after':
                    # need to reverse sort because of how the function works
                    decision_journal_pks = decision_journal_pks.reverse()
                
            else:
                decision_journal_pks = [pk]

            for decision_journal_pk in decision_journal_pks:
                decision_journal = self.allowed_decision_journals().get(pk=decision_journal_pk)

                if field_name == "decision":
                    if self.logged_in_permissions(decision_journal.project).has_edit_decision_journal:
                        old_decision = decision_journal.decision
                        decision_journal.decision = new_value
                        DecisionJournalHistory.add_history(
                            request.user, decision_journal, "changed decision",
                            old_decision, decision_journal.decision)

                elif field_name == "context":
                    if self.logged_in_permissions(decision_journal.project).has_edit_decision_journal:
                        old_context = decision_journal.context
                        decision_journal.context = new_value
                        DecisionJournalHistory.add_history(
                            request.user, decision_journal, "changed context",
                            old_context, decision_journal.context)

                elif field_name == "reason":
                    if self.logged_in_permissions(decision_journal.project).has_edit_decision_journal:
                        old_reason = decision_journal.reason
                        decision_journal.reason = new_value
                        DecisionJournalHistory.add_history(
                            request.user, decision_journal, "changed reason",
                            old_reason, decision_journal.reason)

                elif field_name == "repercussions":
                    if self.logged_in_permissions(decision_journal.project).has_edit_decision_journal:
                        old_repercussions = decision_journal.repercussions
                        decision_journal.repercussions = new_value
                        DecisionJournalHistory.add_history(
                            request.user, decision_journal, "changed repercussions",
                            old_repercussions, decision_journal.repercussions)

                elif field_name == "decision_made_at":
                    if self.logged_in_permissions(decision_journal.project).has_edit_decision_journal:
                        old_decision_made_at = decision_journal.decision_made_at
                        decision_journal.decision_made_at = new_value
                        DecisionJournalHistory.add_history(
                            request.user, decision_journal, "changed decision made at",
                            old_decision_made_at, decision_journal.decision_made_at)

                elif field_name == "decision_made_by":
                    if self.logged_in_permissions(decision_journal.project).has_edit_decision_journal:
                        old_decision_made_by = decision_journal.decision_made_by
                        new_decision_made_by = self.allowed_project_user(decision_journal.project_id, new_value) if new_value else "no-one"
                        decision_journal.decision_made_by = new_decision_made_by
                        
                        DecisionJournalHistory.add_history(
                            request.user, decision_journal, "changed decision made by",
                            old_decision_made_by.username if old_decision_made_by else "no-one",
                            decision_journal.decision_made_by.username if decision_journal.decision_made_by else "no-one")

                        
                else: 
                    raise Exception("Unsupported field name: %s" % field_name)
                decision_journal.save()

            data = {'status': 'success', 'payload': decision_journal_pks}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def create(self, request):

        try:
            context = {}
            params = request.data['item']
            project_id = params['project_id']

            project = self.allowed_project(project_id)
            if not self.logged_in_permissions(project).has_edit_decision_journal:
                raise Exception('Permission denied to create decision_journals')

            def create_decision_journal():

                decision_journal = DecisionJournal.objects.create(project_id=project_id,
                                                                  decision=params.get('decision', None),
                                                                  reason=params.get('reason', None),
                                                                  context=params.get('context', None),
                                                                  repercussions=params.get('repercussions', None),
                                                                  decision_made_at=params.get('decision_made_at', timezone.now()),
                                                                  decision_made_by=params.get('decision_made_by', request.user),
                                                                  created=request.user)

                DecisionJournalHistory.add_history(request.user, decision_journal,
                                                   "created", "", decision_journal.decision)
                return decision_journal

            decision_journal = create_decision_journal()
            context['item'] = DecisionJournalSerializer(decision_journal, logged_in_user=request.user).data
            data = {'status': 'success', 'payload': context}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        res = HttpResponse(JSONRenderer().render(data))
        return res
    
    def delete(self, request, pk):
        try:
            params = request.data
            data = None

            if 'item_ids' in params:
                decision_journal_pks = params['item_ids']
            else:
                decision_journal_pks = [pk]

            for decision_journal_pk in decision_journal_pks:
                decision_journal = self.allowed_decision_journals().get(pk=decision_journal_pk)
                if self.logged_in_permissions(decision_journal.project).has_edit_decision_journal:
                    DecisionJournalHistory.add_history(request.user, decision_journal,
                                                       "deleted", decision_journal.decision, "")
                    decision_journal.delete()
                else:
                    data = {'status': 'failed', 'error_message': 'Permission denied to delete decision journals'}

            if not data:
                data = {'status': 'success', 'payload': decision_journal_pks}

        except Exception as ex:
            logger.exception(ex)
            return self.error_response(ex)

        return HttpResponse(JSONRenderer().render(data))

    def apply_filter(self, qs, raw_filter_args):
        raw_filter_args['__business_project_switch_filter_required'] = False        
        decision_journal_any_field = raw_filter_args.pop('any_field', None)
        if decision_journal_any_field is not None and len(decision_journal_any_field)>1:
            qs = qs.filter(Q(decision__icontains=decision_journal_any_field)\
                           |Q(reason__icontains=decision_journal_any_field)\
                           |Q(context__icontains=decision_journal_any_field)\
                           |Q(repercussions__icontains=decision_journal_any_field))
        return super(DecisionJournalViewSet, self).apply_filter(qs=qs, raw_filter_args=raw_filter_args)

