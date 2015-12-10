try:
    from django.conf.urls import patterns, include, url
except ImportError:
    from django.conf.urls.defaults import patterns, include, url

import views

urlpatterns = patterns('',
                       url(r'^$', views.home, name='home'),
                       url(r'^timesheets$', views.timesheets, name='timesheets'),
                       url(r'^ratios$', views.ratios, name='ratios'),
                       )

