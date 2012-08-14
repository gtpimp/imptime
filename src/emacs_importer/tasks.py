from celery import task
from implicitdesign import settings
from process_for_timepiece import Processor
from datetime import datetime

@task()
def import_timesheets_from_emacs_task():
    import_timesheets_from_emacs()

def import_timesheets_from_emacs():

    user_email = "gtp@implicitdesign.co.za"

    for user in ["alec", "gtp", "stephan"]:

        processor_kwargs = { 'root_folder': settings.EMACSIMPORTER_TIMESHEET_ROOT_FOLDER,
                             'email_from': settings.EMACSIMPORTER_EMAIL_FROM,
                             'num_historical_days': settings.EMACSIMPORTER_NUM_HISTORICAL_DAYS,
                             'pointperson_username': settings.EMACSIMPORTER_POINTPERSON_USERNAME,
                             'rates_info': settings.EMACSIMPORTER_RATES,
                             #'ref_current_date': datetime(2011, 8, 30)
                             }

        Processor(user, user_email, **processor_kwargs).process()
