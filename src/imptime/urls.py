from django.conf.urls import include, url
import project_api
import sprint_api
import issue_api
import issue_attachment_api
import issue_tag_api
import issue_estimate_api
import issue_clock_api
import issue_comment_api
import user_api
import views
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken import views as rest_views

router = DefaultRouter()
router.register(r'auth', project_api.ProjectViewSet,
                base_name='project')
router.register(r'project', project_api.ProjectViewSet,
                base_name='project')
router.register(r'sprint', sprint_api.SprintViewSet,
                base_name='sprint')
router.register(r'issue/tag', issue_tag_api.IssueTagViewSet,
                base_name='issue_tag')
router.register(r'issue/comment', issue_comment_api.IssueCommentViewSet,
                base_name='issue_comment')
router.register(r'issue/attachment', issue_attachment_api.IssueAttachmentViewSet,
                base_name='issue_attachment')
router.register(r'issue/estimate', issue_estimate_api.IssueEstimateViewSet,
                base_name='issue_estimate')
router.register(r'issue/clock', issue_clock_api.IssueClockViewSet,
                base_name='issue_clock')
router.register(r'issue', issue_api.IssueViewSet,
                base_name='issue')
router.register(r'user', user_api.UserViewSet,
                base_name='user')

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^login/', rest_views.obtain_auth_token)

] + router.urls
