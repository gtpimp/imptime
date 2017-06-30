from django.conf.urls import include, url

import views

urlpatterns = [
    url(r'^dashboard/(?P<business_id>\d+)$', views.dashboard, name='dashboard'),
    url(r'^testable_session/(?P<testable_session_id>\d+)$', views.test_session, name='testable_session'),
    url(r'^include_in_regression_test/(?P<testable_id>\d+)$', views.include_in_regression_test, name='include_in_regression_test'),
    url(r'^exclude_from_regression_test/(?P<testable_id>\d+)$', views.exclude_from_regression_test, name='exclude_from_regression_test'),

    url(r'^include_in_regression_test_for_issue/(?P<issue_id>\d+)$', views.include_in_regression_test_for_issue, name='include_in_regression_test_for_issue'),
    url(r'^exclude_from_regression_test_for_issue/(?P<issue_id>\d+)$', views.exclude_from_regression_test_for_issue, name='exclude_from_regression_test_for_issue'),

    url(r'^test_passed/(?P<testable_session_id>\d+)/(?P<testable_id>\d+)$', views.test_passed, name='test_passed'),
    url(r'^test_failed/(?P<testable_session_id>\d+)/(?P<testable_id>\d+)$', views.test_failed, name='test_failed'),
    url(r'^test_untested/(?P<testable_session_id>\d+)/(?P<testable_id>\d+)$', views.test_untested, name='test_untested'),
]

