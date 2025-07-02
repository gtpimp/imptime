from datetime import datetime, timedelta
from django.core.files.base import ContentFile
import os
from caldav.lib import error
from django.conf import settings
import tempfile
from django.core.files import File
from caldav.davclient import DAVClient
from mailqueue.mailqueue_helper import queue_email
from caldav.objects import Principal, Calendar, Event, DAVObject, CalendarSet, FreeBusy
import logging
logger = logging.getLogger(__name__)

class CalDavHelper(object):

    def calendar(self, username):
        url = settings.CALDAV_URL.format(USERNAME=username)
        try:
            client = DAVClient(url=url, username=username, password=self._get_password(username))
            principal = client.principal()
            return principal.calendars()[0]
        except IndexError:
            raise Exception("No calendars for %s" % username)

    def _get_password(self, username):
        return "i" + username

    def get_username_from_url(self, url):
        return url.replace("//","").split("/")[1]

    def update_imptime_event_from_caldav_event(self, caldav_event, imptime_event):
        vevent = caldav_event.instance.vevent
        imptime_event.start = vevent.dtstart.value
        end = vevent.dtend.value
        imptime_event.duration = (end-imptime_event.start).seconds/(60*60)
        try:
            imptime_event.description = vevent.description.value
        except:
            imptime_event.description = vevent.summary.value
        imptime_event.event_type = 'meeting'
        try:
            imptime_event.status = vevent.status.value
        except AttributeError:
            imptime_event.status = "CONFIRMED"
        imptime_event.save(update_caldav=False)

    def update_caldav_event_from_imptime_event(self, caldav_event, imptime_event):
        vevent = caldav_event.instance.vevent
        vevent.dtstart.value = imptime_event.start
        vevent.dtend.value = imptime_event.end
        vevent.description.value = imptime_event.description
        vevent.status.value = imptime_event.status
        caldav_event.save()
        
    def get_event(self, username, uid):
        calendar = self.calendar(username)
        try:
            return calendar.event_by_uid(uid)
        except error.NotFoundError:
            return None
        
    def on_event_saved(self, imptime_event):
        try:
            for user in imptime_event.event_users:
                try:
                    calendar = self.calendar(user.username)
                except Exception as ex:
                    if "No calendars" in str(ex):
                        logger.info("User %s doesn't have a calendar, ignoring" % user.username)
                        continue
                    else:
                        raise
                    
                caldav_event = self.caldav_event_for_imptime_event(imptime_event, calendar)
                if caldav_event:
                    self.update_caldav_event_from_imptime_event(caldav_event, imptime_event)
                else:
                    calendar.add_event(self._create_ical_string(imptime_event))
                    
        except Exception as ex:
            logger.exception(ex)
            raise

    def caldav_event_for_imptime_event(self, imptime_event, calendar):
        uid = self._uid(imptime_event)
        try:
            caldav_event = calendar.event_by_uid(uid)
        except error.NotFoundError as ex:
            logger.exception(ex)
            return None
        except Exception as ex:
            logger.exception(ex)
            raise
        
        return caldav_event
        
    def on_event_deleted(self, imptime_event):
        for user in imptime_event.event_users:
            calendar = self.calendar(user.username)
            caldav_event = self.caldav_event_for_imptime_event(imptime_event, calendar)
            if caldav_event:
                caldav_event.delete()

    def as_ical(self, imptime_event):
        return self._create_ical_string(imptime_event)
                            
    def _create_ical_string(self, event):
        CRLF = "\r\n"
        invitees = (event.send_invites_to or "").split(",")
        invitees += [event.user.email]
        organizer = ("ORGANIZER;CN=organiser:mailto:%s" % event.user.email)

        ddtstart = event.start
        dur = timedelta(hours = int(event.hours))
        dtend = ddtstart + dur
        dtstamp = datetime.now().strftime("%Y%m%dT%H%M%S")
        dtstart = ddtstart.strftime("%Y%m%dT%H%M%S")
        dtend = dtend.strftime("%Y%m%dT%H%M%S")

        description = "DESCRIPTION: %s"%event.description +CRLF
        attendee = ""
        for att in invitees:
            if att.strip():
                attendee += "ATTENDEE;CN="+att+";CUTYPE=INDIVIDUAL:mailto:"+att+CRLF
        ical = "BEGIN:VCALENDAR"+CRLF+"PRODID:imptime"+CRLF+"VERSION:2.0"+CRLF+"CALSCALE:GREGORIAN"+CRLF
        ical += "METHOD:REQUEST"+CRLF
        ical += "BEGIN:VTIMEZONE"+CRLF+\
                "TZID:Africa/Johannesburg"+CRLF+\
                "X-LIC-LOCATION:Africa/Johannesburg"+CRLF+\
                "BEGIN:STANDARD"+CRLF+\
                "DTSTART:18920208T000000"+CRLF+\
                "RDATE;VALUE=DATE-TIME:18920208T000000"+CRLF+\
                "TZNAME:SAST"+CRLF+\
                "TZOFFSETFROM:+0152"+CRLF+\
                "TZOFFSETTO:+0130"+CRLF+\
                "END:STANDARD"+CRLF+\
                "BEGIN:STANDARD"+CRLF+\
                "DTSTART:19030301T000000"+CRLF+\
                "RDATE;VALUE=DATE-TIME:19030301T000000"+CRLF+\
                "TZNAME:SAST"+CRLF+\
                "TZOFFSETFROM:+0130"+CRLF+\
                "TZOFFSETTO:+0200"+CRLF+\
                "END:STANDARD"+CRLF+\
                "BEGIN:DAYLIGHT"+CRLF+\
                "DTSTART:19420920T020000"+CRLF+\
                "RRULE:FREQ=YEARLY;UNTIL=19430919T000000Z;BYDAY=3SU;BYMONTH=9"+CRLF+\
                "TZNAME:SAST"+CRLF+\
                "TZOFFSETFROM:+0200"+CRLF+\
                "TZOFFSETTO:+0300"+CRLF+\
                "END:DAYLIGHT"+CRLF+\
                "BEGIN:STANDARD"+CRLF+\
                "DTSTART:19430321T020000"+CRLF+\
                "RRULE:FREQ=YEARLY;UNTIL=19440318T230000Z;BYDAY=3SU;BYMONTH=3"+CRLF+\
                "TZNAME:SAST"+CRLF+\
                "TZOFFSETFROM:+0300"+CRLF+\
                "TZOFFSETTO:+0200"+CRLF+\
                "END:STANDARD"+CRLF+\
                "END:VTIMEZONE"+CRLF

        ical += "BEGIN:VEVENT"+CRLF+"DTSTART;TZID=Africa/Johannesburg:"+dtstart+CRLF+"DTEND;TZID=Africa/Johannesburg:"+dtend+CRLF+"DTSTAMP:"+dtstamp+CRLF+organizer+CRLF
        ical+= ("UID:%s"%self._uid(event))+CRLF
        ical+= attendee+"CREATED:"+dtstamp+CRLF+description+"LAST-MODIFIED:"+dtstamp+CRLF+"LOCATION:"+CRLF+"SEQUENCE:0"+CRLF+"STATUS:CONFIRMED"+CRLF
        ical+= ("SUMMARY:%s "%event.description[0:80])+CRLF+"TRANSP:OPAQUE"+CRLF+"END:VEVENT"+CRLF+"END:VCALENDAR"+CRLF
        return ical

    def _uid(self, event):
        return event.caldav_uid or ("imptime%s" % event.id)

    def send_invite(self, event, send_invites_to=None):
        send_invites_to = send_invites_to or event.send_invites_to
        ical = self._create_ical_string(event)
        invitees = (send_invites_to or "").split(",")
        invitees += [event.user.email]
        content = """
        You are invited to an event of type {EVENT_TYPE}, starting at {START_TIME}, for {HOURS} hours

        {DESCRIPTION}
        """
        content = content.format(EVENT_TYPE=event.event_type,
                                 START_TIME=event.start.strftime("%d %b %Y %H:%M"),
                                 HOURS=event.hours,
                                 DESCRIPTION=event.description)
                    
        fname = os.path.join(settings.CALDAV_TEMP_FOLDER, "invite_%d.ics" % event.id)
        open(fname, "w").write(ical)
        queue_email(subject_content="Invite on %s : %s" % (event.start.strftime("%d %b %Y %H:%M"),event.description[0:20]),
                    from_address=settings.FROM_EMAIL,
                    text_content=content,
                    html_content=content.replace("\n","<br/>"),
                    to_addresses=invitees,
                    attachments=[ (File(open(fname)), "invite.ics"), ])
                
        # queue_email
        # eml_body = event.description
        # eml_body_bin = event.description
        # msg = MIMEMultipart('mixed')
        # msg['Reply-To']=fro
        # msg['Date'] = formatdate(localtime=True)
        # msg['Subject'] = "pyICSParser invite"+dtstart
        # msg['From'] = fro
        # msg['To'] = ",".join(attendees)

        # part_email = MIMEText(eml_body,"html")
        # part_cal = MIMEText(ical,'calendar;method=REQUEST')

        # msgAlternative = MIMEMultipart('alternative')
        # msg.attach(msgAlternative)

        # ical_atch = MIMEBase('application/ics',' ;name="%s"'%("invite.ics"))
        # ical_atch.set_payload(ical)
        # Encoders.encode_base64(ical_atch)
        # ical_atch.add_header('Content-Disposition', 'attachment; filename="%s"'%("invite.ics"))

        # eml_atch = MIMEBase('text/plain','')
        # Encoders.encode_base64(eml_atch)
        # eml_atch.add_header('Content-Transfer-Encoding', "")

        # msgAlternative.attach(part_email)
        # msgAlternative.attach(part_cal)

        # mailServer = smtplib.SMTP('smtp.gmail.com', 587)
        # mailServer.ehlo()
        # mailServer.starttls()
        # mailServer.ehlo()
        # mailServer.login(login, password)
        # mailServer.sendmail(fro, attendees, msg.as_string())
        # mailServer.close()


        
# import caldav
# from caldav.elements import dav, cdav

# # Caldav url
# url = "https://user:pass@hostname/caldav.php/"

# vcal = """BEGIN:VCALENDAR
# VERSION:2.0
# PRODID:-//Example Corp.//CalDAV Client//EN
# BEGIN:VEVENT
# UID:1234567890
# DTSTAMP:20100510T182145Z
# DTSTART:20100512T170000Z
# DTEND:20100512T180000Z
# SUMMARY:This is an event
# END:VEVENT
# END:VCALENDAR
# """

# client = caldav.DAVClient(url)
# principal = client.principal()
# calendars = principal.calendars()
# if len(calendars) > 0:
#     calendar = calendars[0]
#     print "Using calendar", calendar

#     print "Renaming"
#     calendar.set_properties([dav.DisplayName("Test calendar"),])
#     print calendar.get_properties([dav.DisplayName(),])

#     event = calendar.add_event(vcal)
#     print "Event", event, "created"

#     print "Looking for events in 2010-05"
#     results = calendar.date_search(
#         datetime(2010, 5, 1), datetime(2010, 6, 1))

#     for event in results:
#         print "Found", event
