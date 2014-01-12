try:
    from django.conf.urls import patterns, include, url
except ImportError:
    from django.conf.urls.defaults import patterns, include, url

from timepiece.models import Entry
from timepiece import views, exporter
import jira_interface
import views

urlpatterns = patterns('',
    url(r'^$', views.planner_list, name='list'),

)


