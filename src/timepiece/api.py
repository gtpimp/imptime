import pytz
import datetime

def localised_today():
    return localise_date(datetime.datetime.now())

def localise_date(d):
    if d.tzinfo is None:
        return pytz.timezone("Africa/Johannesburg").localize(d)
    else:
        return pytz.timezone("Africa/Johannesburg").normalize(d)
