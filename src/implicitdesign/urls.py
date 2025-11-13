from django.conf import settings
from django.conf.urls import handler400, handler403, handler404, handler500
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from filebrowser import sites as filebrowser

from django.urls import path, re_path, include
from django.contrib.auth import views as django_auth
from django.contrib.auth.decorators import login_required
from django.contrib.staticfiles.storage import staticfiles_storage
from django.views.generic.base import RedirectView

import timepiece.views as timepiece_views
from implicitdesign import views
from implicitdesign.forms import ImpAuthenticationForm

admin.autodiscover()
admin.site.login = login_required(admin.site.login)

# Error handlers
handler400 = "implicitdesign.views.error_handler_400"
handler403 = "implicitdesign.views.error_handler_403"
handler404 = "implicitdesign.views.error_handler_404"
handler500 = "implicitdesign.views.error_handler_500"

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # Root & static assets
    path("", views.home, name="home"),
    path("robots.txt", views.robots),
    path(
        "favicon.ico",
        RedirectView.as_view(
            url=staticfiles_storage.url("images/icons/implicit_icon.png"),
            permanent=False,
        ),
        name="favicon",
    ),

    # Apps
    path("grappelli/", include("grappelli.urls")),
    path("emacs_importer/", include(("emacs_importer.urls", "emacs_importer"), namespace="emacs_importer")),
    path("imp/", include(("imptime.urls", "imp"), namespace="imp")),
    path("timepiece/", include(("timepiece.urls", "timepiece"))),
    path("welcome/", include(("animated_website.urls", "animated_website"))),
    path("selectable/", include(("selectable.urls", "selectable"))),

    # Misc routes
    path("us/", views.us),

    # File/media serving (for development only)
    re_path(r"^media/(?P<url>.*)$", timepiece_views.download_media),

    # Auth routes
    path("accounts/login/", views.primary_login, name="auth_login"),
    path("accounts/logout/", django_auth.LogoutView.as_view(), name="auth_logout"),
    path("accounts/password-change/", django_auth.PasswordChangeView.as_view(), name="change_password"),
    path("accounts/password-change/done/", django_auth.PasswordChangeDoneView.as_view(), name="password_change_done"),
    path("accounts/password-reset/", django_auth.PasswordResetView.as_view(), name="reset_password"),
    path("accounts/password-reset/done/", django_auth.PasswordResetDoneView.as_view(), name="password_reset_done"),
    re_path(r"^accounts/reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>.+)/$", django_auth.PasswordResetConfirmView.as_view()),
    path("accounts/reset/done/", django_auth.PasswordResetCompleteView.as_view()),

    # Custom endpoints
    path("generate_incremental_timesheet", views.generate_incremental_timesheet, name="generate_incremental_timesheet"),
    path("staff_daylies", views.staff_daylies, name="staff_daylies"),
]

# Static & media (development)
urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
