from django.conf.urls import include, url
import views

urlpatterns = [
                       url(r'^settings/(?P<business_id>\d+)$', views.edit_settings, {}, "settings"),
                       url(r'^my_settings/(?P<business_id>\d+)$', views.my_settings, {}, "my_settings"),
                       url(r'^sync_business_from_jira/(?P<business_id>\d+)$', views.sync_business_from_jira, {}, "sync_business_from_jira"),
                       url(r'^sync_project_to_jira/(?P<timepiece_project_id>\d+)$', views.sync_project_to_jira, {}, "sync_project_to_jira"),
                       url(r'^sync_project_from_jira/(?P<timepiece_project_id>\d+)$', views.sync_project_from_jira, {}, "sync_project_from_jira"),
                       url(r'^sync_issue_from_jira/(?P<issue_id>\d+)$', views.sync_issue_from_jira, {}, "sync_issue_from_jira"),

]
