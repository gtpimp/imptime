try:
    from django.conf.urls import patterns, include, url
except ImportError:
    from django.conf.urls.defaults import patterns, include, url
import views

urlpatterns = patterns('',
                       (r'^settings/(?P<business_id>\d+)$', views.edit_settings, {}, "settings"),
                       (r'^sync_business_from_jira/(?P<business_id>\d+)$', views.sync_business_from_jira, {}, "sync_business_from_jira"),
                       (r'^sync_project_to_jira/(?P<timepiece_project_id>\d+)$', views.sync_project_to_jira, {}, "sync_project_to_jira"),
                       (r'^sync_project_from_jira/(?P<timepiece_project_id>\d+)$', views.sync_project_from_jira, {}, "sync_project_from_jira"),
                       (r'^sync_issue_from_jira/(?P<issue_id>\d+)$', views.sync_issue_from_jira, {}, "sync_issue_from_jira")

)
