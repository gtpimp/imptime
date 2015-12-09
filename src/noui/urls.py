try:
    from django.conf.urls import patterns, include, url
except ImportError:
    from django.conf.urls.defaults import patterns, include, url

import views

command = views.Command()
command.init()

urlpatterns = patterns(
    '',
    url(r'^$', views.command, name='command'),
    url(r'^run_command/', include(command.url_conf())),
)
