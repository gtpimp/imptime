from django.conf.urls import include, url

import views

urlpatterns = [
                       url(r'^$', views.home, name='home'),
                       url(r'^timesheets$', views.timesheets, name='timesheets'),
                       url(r'^progress$', views.progress, name='progress'),
                       url(r'^ratios$', views.ratios, name='ratios'),
               ]

