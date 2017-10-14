from dateutil.relativedelta import relativedelta

def fill_empty_days(self, date_from, date_to, values):
    """ ensures there is a value for each date in values """
    d = date_from
    values_index = 0
    filled_values = []
    while d <= date_to:
        if len(values) > values_index and values[values_index]['started_on'] == d.date():
            filled_values.append(values[values_index])
            values_index += 1
        else:
            filled_values.append({'started_on':d, 'daily_hours':0})
        d += relativedelta(days=1)
    return filled_values

