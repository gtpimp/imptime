from django.conf.urls import include, url
import project_api
import sprint_api
import issue_api
import user_api
import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'project', project_api.ProjectViewSet,
                base_name='project')
router.register(r'sprint', sprint_api.SprintViewSet,
                base_name='sprint')
router.register(r'issue', issue_api.IssueViewSet,
                base_name='issue')
router.register(r'user', user_api.UserViewSet,
                base_name='user')

urlpatterns = [
    url(r'^$', views.home, name='home')

] + router.urls
