from django.conf import settings
from django.conf.urls import (handler400, handler403, handler404, handler500,
                              include, url)
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from filebrowser import sites as filebrowser

admin.autodiscover()
import django.contrib.auth.views as django_auth
import timepiece.views as timepiece_views
from django.contrib.auth.decorators import login_required
from django.contrib.staticfiles.storage import staticfiles_storage
from django.views.generic.base import RedirectView

admin.site.login = login_required(admin.site.login)

import views
from forms import ImpAuthenticationForm

handler400 = "implicitdesign.views.error_handler_400"
handler403 = "implicitdesign.views.error_handler_403"
handler404 = "implicitdesign.views.error_handler_404"
handler500 = "implicitdesign.views.error_handler_500"

urlpatterns = [
    url(r"^admin/", include(admin.site.urls)),
    url(r"^$", views.home, name="home"),
    url(r"^robots.txt$", views.robots),
    url(
        r"^favicon.ico$",
        RedirectView.as_view(
            url=staticfiles_storage.url("images/icons/implicit_icon.png"),
            permanent=False,
        ),
        name="favicon",
    ),
    url(r"^grappelli/", include("grappelli.urls")),
    url(
        r"^emacs_importer/", include("emacs_importer.urls", namespace="emacs_importer")
    ),
    url(r"^imp/", include("imptime.urls", namespace="imp"), name="imptime"),
    url(r"^timepiece/", include("timepiece.urls"), name="timepiece"),
    url(r"^welcome/", include("animated_website.urls"), name="animated_website"),
    url(r"^selectable/", include("selectable.urls"), name="selectable"),
    url(r"^us/", views.us),
    # don't rely on this, exists to ensure no media gets served without going through django.
    url(r"^media/(?P<url>.*)$", timepiece_views.download_media),
    url(r"^accounts/login/$", views.primary_login, name="auth_login"),
    url(r"^accounts/logout/$", django_auth.logout_then_login, name="auth_logout"),
    url(
        r"^accounts/password-change/$",
        django_auth.password_change,
        name="change_password",
    ),
    url(
        r"^accounts/password-change/done/$",
        django_auth.password_change_done,
        name="password_change_done",
    ),
    url(
        r"^accounts/password-reset/$", django_auth.password_reset, name="reset_password"
    ),
    url(
        r"^accounts/password-reset/done/$",
        django_auth.password_reset_done,
        name="password_reset_done",
    ),
    url(
        r"^accounts/reset/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$",
        django_auth.password_reset_confirm,
    ),
    url(r"^accounts/reset/done/$", django_auth.password_reset_complete),
    url(
        r"^generate_incremental_timesheet",
        views.generate_incremental_timesheet,
        name="generate_incremental_timesheet",
    ),
    url(r"^staff_daylies", views.staff_daylies, name="staff_daylies"),
]

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
