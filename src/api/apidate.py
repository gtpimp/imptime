import json
import datetime
from dateutil.relativedelta import relativedelta
from dateutil.parser import parse
import calendar
from django.utils import timezone
import pytz
import decimal
import logging
logger = logging.getLogger(__name__)

def convert_iso_string_to_utc_datetime(iso_string):
    if iso_string is None:
        return iso_string
    d = parse(iso_string)
    return pytz.UTC.normalize(d)

def convert_iso_string_to_local_datetime(iso_string):
    if iso_string is None:
        return iso_string
    d = parse(iso_string)
    return timezone.localtime(d)

def convert_datetime_to_iso_string(datetime_with_tzinfo):
    if datetime_with_tzinfo is None:
        return None
    return datetime_with_tzinfo.isoformat()

def today_in_local_timezone():
    return timezone.localtime(timezone.now())

def today_in_utc():
    return pytz.UTC.normalize(today_in_local_timezone())
