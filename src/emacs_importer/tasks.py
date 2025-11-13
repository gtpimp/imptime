from celery import shared_task
from implicitdesign import settings
from datetime import datetime
from emacs_importer.extract_for_timepiece import Extractor
from timepiece.models import UserNotification
from django.contrib.auth.models import User

@shared_task
def import_timesheets_from_emacs_task():
    return import_timesheets_from_emacs()

def import_timesheets_from_emacs(users=None):

    status = {'errors':[], 'infos':[]}
    users = users or settings.EMACS_USERS_TO_PROCESS
    for username in users:

        kwargs = { 'username': username,
                   'root_input_folder': settings.EMACSIMPORTER_TIMESHEET_ROOT_FOLDER,
                   'pointperson_username': settings.EMACSIMPORTER_POINTPERSON_USERNAME,
                   }

        extractor = Extractor(**kwargs)
        #extractor.refresh_from_git()
        extract_result = extractor.extract()
        status[username] = { 'status' : extract_result }
        status['errors'].extend(extract_result['errors'])
        status['infos'].extend(extract_result['infos'])

        UserNotification.create_graph_notification(user=User.objects.get(username=username), force=True)
                         
    return status
