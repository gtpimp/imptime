import views

try:
    from django.conf.urls import patterns, include, url
except ImportError:
    from django.conf.urls.defaults import patterns, include, url


urlpatterns = patterns(
    '',
    url(r'^$', views.run_command, name='command'),

    url(r'^commands/', views.command_list, name='command_list'),
    url(r'^command/add', views.command_add, name='command_add'),
    url(r'^command/edit/(?P<command_ref>\d+)', views.command_edit, name='command_edit'),
    url(r'^command/delete/(?P<command_ref>\d+)', views.command_delete, name='command_delete'),
)
