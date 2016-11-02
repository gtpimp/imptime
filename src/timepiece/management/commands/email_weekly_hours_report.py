from django.core.management.base import BaseCommand, CommandError
from timepiece import models
from django.conf import settings
from django.contrib.auth.models import User
from mailqueue.mailqueue_helper import queue_email
import datetime
from dateutil.relativedelta import relativedelta
from timepiece import models as timepiece
from django.utils.datastructures import SortedDict
from django.db.models import Sum, Count, Q, F, Max, Min


class Command(BaseCommand):
    args = ""
    help = "Email the weekly hour-report to the recipient specified in settings.WEEKLY_HOURS_MAIL_RECIPIENT"

    def handle(self, **kwargs):

        if not settings.WEEKLY_HOURS_MAIL_RECIPIENT:
            raise Exception("'WEEKLY_HOURS_MAIL_RECIPIENT' is not set in the settings.py")
        else:
            email_recipient_address = settings.WEEKLY_HOURS_MAIL_RECIPIENT

        users = User.objects.all().filter(is_active=True, is_staff=True).exclude(username="us")
        today = datetime.datetime.today().date()

        from_date = today - relativedelta(days=14)
        from_date = from_date.replace(day=1)

        to_date = today

        content = ""

        for user in users:
            entries = timepiece.Entry.objects.filter(user=user)
            hours = self.get_daily_hours(user, entries, from_date, to_date)

            for start_date, values in hours['total_hours_by_month'].items():
                content += self.create_row(user, start_date, values) + "\n\r"

            content += "\n\r"

        subject_content = "Weekly hours report for %s\n\r" % (from_date.strftime("%d %b %Y %H:%M"))
        recipients = [email_recipient_address]
        queue_email(subject_content=subject_content,
                    from_address=settings.FROM_EMAIL,
                    text_content=content,
                    html_content=content.replace("\n", "<br/>"),
                    to_addresses=recipients)

    def create_row(self, user, start_date, values):
        total_available_hours_per_month = values['total_available_hours_per_month']
        total_worked_hours_per_month = values['total_worked_hours_per_month']

        return "%12s, %s, available hours = %3d, worked hours = %3d" % (user,
                                                                      start_date,
                                                                      total_available_hours_per_month,
                                                                      total_worked_hours_per_month)

    def get_daily_hours(self, user, entries, from_date=None, to_date=None):
        entries = entries.filter(start_time__gte=from_date, start_time__lte=to_date).extra(
            {'on_day': 'date(start_time)'})
        entries_hours_per_day = entries.values('on_day').order_by("on_day").annotate(total_hours=Sum('hours'))
        daily_hours_by_project = entries.values('on_day', 'issue__project__business__name',
                                                'issue__project__name').order_by("on_day",
                                                                                 "issue__project__business__name",
                                                                                 "issue__project__name").annotate(
            total_hours=Sum('hours'))

        hours_per_day = {}
        for entry_hours_per_day in entries_hours_per_day:
            hours_per_day[entry_hours_per_day['on_day']] = entry_hours_per_day['total_hours']

        hours = SortedDict()
        daily_average_hours_per_week = SortedDict()
        daily_average_hours_per_month = SortedDict()

        running_date = from_date
        running_hours_per_week = 0
        running_days_in_week = 0
        running_hours_per_month = 0
        running_days_in_month = 0

        total_hours_by_month = SortedDict()

        month_date = running_date.replace(day=1)
        total_hours_by_month[month_date] = {'total_available_hours_per_month': 0,
                                            'total_worked_hours_per_month': 0}
        while running_date <= to_date:

            hours_this_day = hours_per_day.get(running_date, 0)
            hours[running_date] = hours_this_day

            if running_date.weekday() == 0:
                running_days_in_week = 0
                running_hours_per_week = 0
            if running_date.day == 1:
                running_days_in_month = 0
                running_hours_per_month = 0
                month_date = running_date.replace(day=1)
                total_hours_by_month[month_date] = {'total_available_hours_per_month': 0,
                                                    'total_worked_hours_per_month': 0}

            running_hours_per_week += hours_this_day
            running_hours_per_month += hours_this_day
            total_hours_by_month[month_date]['total_worked_hours_per_month'] += hours_this_day

            if not timepiece.Holiday.is_a_holiday(running_date) and not timepiece.CalendarEvent.is_on_leave(
                    running_date,
                    user):
                running_days_in_week += 1
                running_days_in_month += 1
                total_hours_by_month[month_date][
                    'total_available_hours_per_month'] += user.profile.required_daily_work_hours

            daily_average_hours_per_week[running_date] = float(running_hours_per_week) / (running_days_in_week or 1)
            daily_average_hours_per_month[running_date] = float(running_hours_per_month) / (running_days_in_month or 1)
            running_date += relativedelta(days=1)

        return {'daily_hours': hours,
                'weekly_average': daily_average_hours_per_week,
                'monthly_average': daily_average_hours_per_month,
                'daily_hours_by_project': daily_hours_by_project,
                'total_hours_by_month': total_hours_by_month}
