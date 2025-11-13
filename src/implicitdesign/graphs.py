import settings
import os
from dateutil.relativedelta import relativedelta
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from timepiece.models import Entry
from django.contrib.auth.models import User
import smtplib
from datetime import datetime, date
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.image import MIMEImage
from email.mime.text import MIMEText
from email.utils import COMMASPACE, formatdate
from email import encoders

def daily_graph(username, from_date, to_date, test=False):

    filename = "%s.png" % username
    graph_file = os.path.join(settings.EMACSIMPORTER_TEMP_DIR, filename)

    plt.figure()

    points_x = []
    points_y = []

    user = User.objects.get(username=username)
    entries = Entry.objects.filter(user=user).filter(start_time__gte=from_date, end_time__lte=to_date)

    entries = _get_daily_hours(entries)
    running_date = date(year=from_date.year, month=from_date.month, day=from_date.day)
    while running_date <= to_date:
        if running_date in entries:
            hours = entries[running_date]
        else:
            hours = 0
        points_x.append(running_date.toordinal())
        points_y.append(hours)
        running_date += relativedelta(days=1)
    _plot(points_x, points_y, label="Daily graph for %s" % username, output_file=graph_file)

    if test:
        print("As test : %s" % graph_file)
        to = ["gtp@implicitdesign.co.za"]
    else:
        to = list(set(settings.EMACS_ADMIN_USER_EMAILS + [user.email]))
    _send_mail(attachments=[graph_file,], text='Daily graph for %s' % username, 
               email_to=to, content_type="image/png", title="Daily graph for %s" % username)
    
def _get_daily_hours(entries):
    hours = {}
    for entry in entries:
        d = date(year=entry.start_time.year, month=entry.start_time.month, day=entry.start_time.day)
        if d not in hours:
            hours[d] = entry.hours
        else:
            hours[d] += entry.hours
    return hours

def _plot(points_x, points_y, label, output_file):
    plt.plot_date(points_x, points_y, label=label, linewidth=1, linestyle='-', drawstyle='steps-mid', marker='None', fillstyle='full')

    if len(points_x) > 0:
        #tstart = datetime.fromordinal(points_x[0])
        #tend = datetime.fromordinal(points_x[-1])
        #if tstart.month == tend.month and tstart.year == tend.year:
        plt.gca().xaxis.set_major_formatter(matplotlib.dates.DateFormatter('%a %d %b'))
        plt.gca().xaxis.set_major_locator(matplotlib.dates.WeekdayLocator(byweekday=matplotlib.dates.MO))
        plt.gca().xaxis.set_major_locator(matplotlib.dates.DayLocator())

        for label in plt.gca().get_xticklabels():
            label.set_fontsize(6)
        for label in plt.gca().get_yticklabels():
            label.set_fontsize(6)

        plt.subplots_adjust(bottom=0.2)
        plt.xticks( rotation=90 )
        plt.title(os.path.basename(output_file))
        plt.xlabel('days')
        plt.ylabel('hours')

        plt.plot_date(points_x, list(8 for x in points_x))

    plt.savefig(output_file)

def _send_mail(attachments, text, email_to, content_type, title):

        msg = MIMEMultipart()
        msg['From'] = settings.EMAIL_HOST_USER
        msg['Date'] = formatdate(localtime=True)
        msg['Subject'] = title
        msg['ReplyTo'] = settings.EMAIL_HOST_USER
        msg['Return'] = settings.EMAIL_HOST_USER

        msg.attach( MIMEText(title) )

        for f in attachments:
            part = MIMEBase(content_type.split("/")[0], content_type.split("/")[1])
            part.set_payload( open(f,"r").read() )
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', 'attachment', filename=os.path.basename(f))
            msg.attach(part)

        for email_tum in email_to: 
            smtp = smtplib.SMTP(settings.EMAIL_HOST)
            msg['To'] = email_tum
            smtp.sendmail(settings.EMAIL_HOST_USER, email_tum, msg.as_string())
            smtp.close()
            print("email sent to " + str(email_tum))
