from django.conf.urls import include, url

import views

urlpatterns = [
    url(r'^dashboard/(?P<business_id>\d+)$', views.dashboard, name='dashboard')
]

