from django.conf.urls import include, url

from django.contrib import admin
admin.autodiscover()

from emacs_importer import views

urlpatterns = [
                       url(r'^import_timesheets$', views.import_timesheets, name='import_timesheets'),
                       url(r'^import_timesheet$', views.import_timesheet, name='import_timesheet'),
                       url(r'^export_project_to_emacs/(?P<project_id>\d+)$', views.export_project_to_emacs, {}, name='export_project_to_emacs'),

                       ]
