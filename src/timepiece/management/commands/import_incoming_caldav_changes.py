from django.core.management.base import BaseCommand, CommandError
from timepiece import models as timepiece
from mailqueue.mailqueue_helper import queue_email, queue_admin_email
from timepiece.caldav_helper import CalDavHelper
import os
from emacs_importer import models as redmine_models
from django.conf import settings
from django.contrib.auth.models import User

import logging
logger = logging.getLogger(__name__)

class Command(BaseCommand):

    args = "None"
    help = "Fetch all caldav changes from external calendars and import them"

    """ this class expects changes to be written out using a davical function something like this:

        function log_caldav_action($put_action_type, $uid, $user_no, $collection_id, $path) {

          $filename = "/home/timesheet/incoming_caldav_changes/change_".time().".csv";
          while( file_exists( $filename ) ) {
            $filename = $filename."x";
          }
          $f = fopen( $filename, "w" );
          $line = $put_action_type."|".$uid."|".$user_no."|".$collection_id."|".$path;
          fwrite( $f, $line );
          fclose($f);

        }

    """
        
    def handle(self, *args, **kwargs):

        for filename in sorted(os.listdir(settings.CALDAV_INCOMING_CALDAV_CHANGES_FOLDER)):
            if not filename.startswith("change_"):
                continue
            filepath = os.path.join(settings.CALDAV_INCOMING_CALDAV_CHANGES_FOLDER, filename)
            self._process_file(filepath)
            os.remove(filepath)

    def _process_file(self, filepath):
        cal_info = open(filepath).read().strip()
        action_type, uid, davical_user_id, davical_collection_id, davical_path = cal_info.split("|")

        if not uid.strip():
            uid = davical_path.split("/")[-1].split(".")[0]
        uid = uid.replace("imptime","")
        imptime_uid = "imptime%s" % uid

        caldav_event = None
        try:
            caldav = CalDavHelper()
            username = caldav.get_username_from_url(davical_path)
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                logger.exception("No user with username=%s. Caldav event uid=%s" % (username, uid))
                return
            
            if action_type == 'DELETE':
                try:
                    imptime_event = timepiece.CalendarEvent.objects.get(caldav_uid=imptime_uid)
                except timepiece.CalendarEvent.DoesNotExist:
                    return
                
                queue_email(subject_content = "Event deleted",
                            text_content = "Event deleted by external calendar: %s\n\n%s" % (imptime_event, caldav.as_ical(imptime_event)),
                            html_content = ("Event deleted by external calendar: %s<br/><br/>%s" % (imptime_event, caldav.as_ical(imptime_event))).replace("\n", "<br/>"),
                            to_addresses=[user.email])
                imptime_event.delete(update_caldav=False)

            elif action_type == "UPDATE":
                caldav_event = caldav.get_event(username, uid)
                if caldav_event is None:
                    logger.error("No event found with uid=%s" % uid)
                    return
                try:
                    imptime_event = timepiece.CalendarEvent.objects.get(caldav_uid=imptime_uid)
                except timepiece.CalendarEvent.DoesNotExist:
                    imptime_event = timepiece.CalendarEvent(user=user, caldav_uid=imptime_uid)
                caldav.update_imptime_event_from_caldav_event(caldav_event=caldav_event, imptime_event=imptime_event)
                queue_email(subject_content = "Event updated",
                            text_content = "Event updated by external calendar: %s\n\n%s" % (imptime_event, caldav.as_ical(imptime_event)),
                            html_content = ("Event updated by external calendar: %s<br/><br/>%s" % (imptime_event, caldav.as_ical(imptime_event))).replace("\n", "<br/>"),
                            to_addresses=[user.email])

            elif action_type == "INSERT":
                caldav_event = caldav.get_event(username, uid)
                if caldav_event is None:
                    logger.error("No event found with uid=%s" % uid)
                    return
                try:
                    imptime_event = timepiece.CalendarEvent.objects.get(caldav_uid=imptime_uid)
                except timepiece.CalendarEvent.DoesNotExist:
                    imptime_event = timepiece.CalendarEvent(user=user, caldav_uid=imptime_uid)
                caldav.update_imptime_event_from_caldav_event(caldav_event=caldav_event, imptime_event=imptime_event)
                queue_email(subject_content = "Event created",
                            text_content = "Event created by external calendar: %s\n\n%s" % (imptime_event, caldav.as_ical(imptime_event)),
                            html_content = ("Event created by external calendar: %s<br/><br/>%s" % (imptime_event, caldav.as_ical(imptime_event))).replace("\n", "<br/>"),
                            to_addresses=[user.email])
        except Exception as ex:
            logger.exception(ex)
            logger.error("Caldav error: %s. %s %s %s %s" % (ex, action_type, uid, davical_user_id, davical_path))
            if caldav_event:
                logger.error(caldav_event.data)
            queue_admin_email(subject="Caldav error", msg="Caldav error: %s. %s %s %s %s." % (ex, action_type, uid, davical_user_id, davical_path))
