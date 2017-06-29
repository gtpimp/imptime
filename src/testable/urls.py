from django.conf.urls import include, url

import views

urlpatterns = [
    url(r'^dashboard/(?P<business_id>\d+)$', views.dashboard, name='dashboard'),
    url(r'^test_session/(?P<business_id>\d+)$', views.test_session, name='test_session'),
    url(r'^include_in_regression_test/(?P<testable_id>\d+)$', views.include_in_regression_test, name='include_in_regression_test'),
    url(r'^exclude_from_regression_test/(?P<testable_id>\d+)$', views.exclude_from_regression_test, name='exclude_from_regression_test')
]

