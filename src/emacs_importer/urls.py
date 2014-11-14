from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

import views

urlpatterns = patterns('',
                       url(r'^import_timesheets$', views.import_timesheets, name='import_timesheets')

                       )