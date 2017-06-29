from django.conf.urls import include, url

import views

urlpatterns = [
    url(r'^dashboard/(?P<business_id>\d+)$', views.dashboard, name='dashboard'),
    url(r'^test_session/(?P<business_id>\d+)$', views.test_session, name='test_session')
]

