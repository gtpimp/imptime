from django.conf.urls import include, url
import annotated_visual_spec_document_api
import auth_api
import billable_hours_statement_api
import company_api
import company_user_permission_api
import cost_summary_api
import decision_journal_api
import estimate_summary_api
import filter_api
import issue_api
import clock_api
import event_log_api
import invoice_api
import issue_comment_api
import issue_estimate_api
import issue_history_api
import issue_review_api
import mien_api
import multiple_issue_summary_api
import nudge_api
import company_problem_api
import schedule_api
import schedule_item_api
import print_api
import project_api
import project_dashboard_api
import project_statement_api
import work_summary_api
import project_user_permission_api
import release_note_api
import feature_api
import sprint_api
import sprint_deadline_api
import sprint_review_api
import sprint_roadmap_api
import sprint_snapshot_api
import sprint_user_rate_api
import testable_api
import testable_line_api
import tag_api
import time_chart_api
import time_summary_api
import user_api
import views
import visual_spec_document_api
import visual_spec_issue_api
import visual_spec_annotation_api
import wiki_api 
from rest_framework.routers import DefaultRouter
from visual_spec_document_download import VisualSpecDocumentPreviewView, VisualSpecDocumentDownloadView
from visual_spec_document_download import VisualSpecDocumentHiresView, VisualSpecDocumentMediumResPreviewView

router = DefaultRouter()
router.register(r'auth', auth_api.AuthViewSet,
                base_name='auth')
router.register(r'autologin', auth_api.AutoLoginViewSet,
                base_name='authlogin')
router.register(r'billable_hours_statement', billable_hours_statement_api.BillableHoursStatementViewSet,
                base_name='billable_hours_statement')
router.register(r'permission/project', project_user_permission_api.ProjectUserPermissionViewSet,
                base_name='project_permission')
router.register(r'permission/company', company_user_permission_api.CompanyUserPermissionViewSet,
                base_name='company_permission')
router.register(r'rate/sprint', sprint_user_rate_api.SprintUserRateViewSet,
                base_name='sprint_user_rate')
router.register(r'project', project_api.ProjectViewSet,
                base_name='project')
router.register('invoice', invoice_api.InvoiceViewSet,
                base_name='invoice')
router.register(r'time_chart', time_chart_api.TimeChartViewSet,
                base_name='time_chart')
router.register(r'sprint_deadline', sprint_deadline_api.SprintDeadlineViewSet,
                base_name='sprint_deadline')
router.register(r'sprint_roadmap', sprint_roadmap_api.SprintRoadmapViewSet,
                base_name='sprint_roadmap')
router.register(r'sprint_snapshot', sprint_snapshot_api.SprintSnapshotViewSet,
                base_name='sprint_snapshot')
router.register(r'sprint_review', sprint_review_api.SprintReviewViewSet,
                base_name='sprint_review')
router.register(r'sprint', sprint_api.SprintViewSet,
                base_name='sprint')
router.register(r'feature', feature_api.FeatureViewSet,
                base_name='feature')
router.register(r'issue/comment', issue_comment_api.IssueCommentViewSet,
                base_name='issue_comment')
router.register(r'issue/estimate', issue_estimate_api.IssueEstimateViewSet,
                base_name='issue_estimate')
router.register(r'issue_history', issue_history_api.IssueHistoryViewSet,
                base_name='issue_history')
router.register(r'issue_review', issue_review_api.IssueReviewViewSet,
                base_name='issue_review')
router.register(r'clock', clock_api.ClockViewSet,
                base_name='clock')
router.register(r'company_problem', company_problem_api.CompanyProblemViewSet,
                base_name='company_problem')
router.register(r'auto_clock', clock_api.ClockViewSet,
                base_name='auto_clock') #duplicate of /clock, maybe to be resolved, unclear right not if they'll diverge
router.register(r'issue/testable', testable_api.TestableViewSet,
                base_name='testable')
router.register(r'feature/testable', testable_api.TestableViewSet,
                base_name='testable')
router.register(r'testable', testable_api.TestableViewSet,
                base_name='testable')
router.register(r'testable_line', testable_line_api.TestableLineViewSet,
                base_name='testable_line')
router.register(r'visual_spec_document', visual_spec_document_api.VisualSpecDocumentViewSet,
                base_name='visual_spec_document')
router.register(r'annotated_visual_spec_document', annotated_visual_spec_document_api.AnnotatedVisualSpecDocumentViewSet,
                base_name='annotated_visual_spec_document')
router.register(r'visual_spec_issue', visual_spec_issue_api.VisualSpecIssueViewSet,
                base_name='visual_spec_issue')
router.register(r'visual_spec_annotation', visual_spec_annotation_api.VisualSpecAnnotationViewSet,
                base_name='visual_spec_annotation')
router.register(r'issue', issue_api.IssueViewSet,
                base_name='issue')
router.register(r'issue_share', issue_api.IssueShareViewSet,
                base_name='share_issue')
router.register(r'tag', tag_api.TagViewSet,
                base_name='tag')
router.register(r'user', user_api.UserViewSet,
                base_name='user')
router.register(r'nudge', nudge_api.NudgeViewSet,
                base_name='nudge')
router.register(r'schedule', schedule_api.ScheduleViewSet,
                base_name='schedule')
router.register(r'calendar_event', schedule_item_api.ScheduleItemViewSet,
                base_name='calendar_event')
router.register(r'mien', mien_api.MienViewSet,
                base_name='mien_api')
router.register(r'multiple_issue_summary', multiple_issue_summary_api.MultipleIssueSummaryViewSet,
                base_name='multiple_issue_summary_api')
router.register(r'filter', filter_api.FilterViewSet,
                base_name='filter')
router.register(r'company', company_api.CompanyViewSet,
                base_name='company')
router.register(r'sprint_cost_summary', cost_summary_api.CostSummaryViewSet,
                base_name='sprint_cost_summary')
router.register(r'event_log', event_log_api.EventLogViewSet,
                base_name='event_log')
router.register(r'time_summary', time_summary_api.TimeSummaryViewSet,
                base_name='time_summary')
router.register(r'estimate_summary', estimate_summary_api.EstimateSummaryViewSet,
                base_name='estimate_summary')
router.register(r'decision_journal', decision_journal_api.DecisionJournalViewSet,
                base_name='decision_journal')
router.register(r'project_dashboard', project_dashboard_api.ProjectDashboardViewSet,
                base_name='project_dashboard')
router.register(r'project_statement', project_statement_api.ProjectStatementViewSet,
                base_name='project_statement')
router.register(r'release_note', release_note_api.ReleaseNoteViewSet,
                base_name='release_note') 
router.register(r'wiki', wiki_api.WikiViewSet,
                base_name='wiki')
router.register(r'work_summary', work_summary_api.WorkSummaryViewSet,
                base_name='work_summary')

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^login/', auth_api.LoginViewSet.as_view()),
    url(r'^otp_email/', auth_api.OtpEmailViewSet.as_view()),
    url(r'^visual_spec_document/(?P<visual_spec_document_id>.*)/download', VisualSpecDocumentDownloadView.as_view(), name='download_visual_spec_document'),
    url(r'^visual_spec_document/(?P<visual_spec_document_id>.*)/hires', VisualSpecDocumentHiresView.as_view(), name='hires_visual_spec_document'),
    url(r'^visual_spec_document/(?P<visual_spec_document_id>.*)/medium_res', VisualSpecDocumentMediumResPreviewView.as_view(), name='hires_visual_spec_document'),
    url(r'^visual_spec_document/(?P<visual_spec_document_id>.*)/preview', VisualSpecDocumentPreviewView.as_view(), name='preview_visual_spec_document'),
    url(r'^pdf/(?P<filename>.*)/', print_api.PrintViewSet.as_view(), name='print_pdf'),

] + router.urls
