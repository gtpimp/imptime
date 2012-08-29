from django.conf.urls import patterns, include, url
from filebrowser import sites as filebrowser
from django.contrib import admin
admin.autodiscover()

import views

urlpatterns = patterns('',

                       url(r'^admin/', include(admin.site.urls)),

                       url(r'^$', views.home),
                       
                       url(r'^emacs_importer/', include('emacs_importer.urls', namespace='emacs_importer')),
                       url(r'^timepiece/', include('timepiece.urls'), name='timepiece'),
                       url(r'^selectable/', include('selectable.urls'), name='selectable'),
                       url(r'^timesheetfiles/', include(filebrowser.site.urls)),
                       
                       url(r'^accounts/login/$', 'django.contrib.auth.views.login', name='auth_login'),
                       url(r'^accounts/logout/$', 'django.contrib.auth.views.logout_then_login', name='auth_logout'),
                       url(r'^accounts/password-change/$', 'django.contrib.auth.views.password_change', name='change_password'),
                       url(r'^accounts/password-change/done/$', 'django.contrib.auth.views.password_change_done'),
                       url(r'^accounts/password-reset/$', 'django.contrib.auth.views.password_reset', name='reset_password'),
                       url(r'^accounts/password-reset/done/$', 'django.contrib.auth.views.password_reset_done'),
                       url(r'^accounts/reset/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$', 'django.contrib.auth.views.password_reset_confirm'),
                       url(r'^accounts/reset/done/$', 'django.contrib.auth.views.password_reset_complete'),

)
