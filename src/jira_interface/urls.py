try:
    from django.conf.urls import patterns, include, url
except ImportError:
    from django.conf.urls.defaults import patterns, include, url
import views

urlpatterns = patterns('',
                       (r'^settings/(?P<business_id>\d+)$', views.edit_settings, {}, "settings"),
                       (r'^sync_business/(?P<business_id>\d+)$', views.sync_business, {}, "sync_business"),
                       (r'^sync_business_to_jira/(?P<business_id>\d+)$', views.sync_business_to_jira, {}, "sync_business_to_jira"),

)
