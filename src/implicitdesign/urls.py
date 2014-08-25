from django.conf.urls import patterns, include, url
from filebrowser import sites as filebrowser
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib import admin
from django.conf.urls.static import static
import settings
admin.autodiscover()
from django.contrib.auth.decorators import login_required

admin.site.login = login_required(admin.site.login)

import views

urlpatterns = patterns('',

                       url(r'^admin/', include(admin.site.urls)),

                       url(r'^$', views.home, name='home'),
          
                       url( r'^grappelli/', include('grappelli.urls') ),
                       url(r'^emacs_importer/', include('emacs_importer.urls', namespace='emacs_importer')),
                       url(r'^timepiece/', include('timepiece.urls'), name='timepiece'),
                       url(r'^imp/', include('animated_website.urls'), name='animated_website'),
                       url(r'^selectable/', include('selectable.urls'), name='selectable'),
#                       url(r'^timesheetfiles/', include(filebrowser.site.urls)),

                       url(r'^us/', views.us),
                       
                       url(r'^accounts/login/$', 'django.contrib.auth.views.login', {'template_name': 'admin/login.html'}, name='auth_login'),
                       url(r'^accounts/logout/$', 'django.contrib.auth.views.logout_then_login', name='auth_logout'),
                       url(r'^accounts/password-change/$', 'django.contrib.auth.views.password_change', name='change_password'),
                       url(r'^accounts/password-change/done/$', 'django.contrib.auth.views.password_change_done', name='password_change_done'),
                       url(r'^accounts/password-reset/$', 'django.contrib.auth.views.password_reset', name='reset_password'),
                       url(r'^accounts/password-reset/done/$', 'django.contrib.auth.views.password_reset_done', name='password_reset_done'),
                       url(r'^accounts/reset/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$', 'django.contrib.auth.views.password_reset_confirm'),
                       url(r'^accounts/reset/done/$', 'django.contrib.auth.views.password_reset_complete'),
                       
                       url(r'^generate_incremental_timesheet', views.generate_incremental_timesheet, name='generate_incremental_timesheet'),
                       url(r'^staff_daylies', views.staff_daylies, name='staff_daylies'),
                       

)

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
