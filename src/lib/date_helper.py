from dateutil.parser import parse
from django.utils import timezone
from datetime import datetime
from datetime import timedelta
import pytz
import logging
logger = logging.getLogger(__name__)


def convert_iso_string_to_utc_datetime(iso_string):
    if iso_string is None:
        return iso_string
    if type(iso_string) == datetime:
        return iso_string
    d = parse(iso_string)
    return pytz.UTC.normalize(d)


def convert_timestamp_to_utc_datetime(timestamp):
    return datetime.fromtimestamp(int(timestamp), pytz.timezone('UTC'))


def convert_iso_string_to_local_datetime(iso_string):
    if iso_string is None:
        return iso_string
    if type(iso_string) == datetime:
        return iso_string
    d = parse(iso_string)
    return timezone.localtime(d)


def convert_datetime_to_iso_string(datetime_with_tzinfo):
    return datetime_with_tzinfo.isoformat()


def today_in_local_timezone():
    return timezone.localtime(timezone.now())


def today_in_utc():
    return pytz.UTC.normalize(today_in_local_timezone())


def format_iso_string(iso_string):
    d = convert_iso_string_to_local_datetime(iso_string)
    return d.strftime("%d %B %Y")

def human_readable_hours(decimal_hours):
    return "%02d:%02d" % divmod(decimal_hours*60, 60)

def daterange(date_from_inclusive, date_to_inclusive):
    for n in range(int ((date_to_inclusive - date_from_inclusive).days+1)):
        yield date_from_inclusive + timedelta(n)
        
