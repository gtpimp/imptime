from django.conf.urls import patterns, include, url
import project_api
import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'project', project_api.ProjectViewSet,
                base_name='project')

urlpatterns = [
    url(r'^$', views.home, name='home')

] + router.urls
