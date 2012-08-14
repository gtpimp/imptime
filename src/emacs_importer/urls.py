from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

import views

urlpatterns = patterns('',
                       url(r'^do_import$', views.do_import, name='do_import')

                       )