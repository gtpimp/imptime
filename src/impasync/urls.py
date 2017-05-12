from django.conf.urls import url

import views

urlpatterns = [
    url(r'^force_refresh/$', views.force_refresh, name='force_refresh')
]
