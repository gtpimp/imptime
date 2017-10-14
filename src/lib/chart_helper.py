from dateutil.relativedelta import relativedelta

def fill_empty_days(date_from, date_to, values, x_label='started_on', y_label='daily_hours'):
    """ ensures there is a value for each date in values """
    d = date_from
    values_index = 0
    filled_values = []
    while d <= date_to:
        if len(values) > values_index and values[values_index][x_label] == d.date():
            filled_values.append(values[values_index])
            values_index += 1
        else:
            filled_values.append({x_label:d, y_label:0})
        d += relativedelta(days=1)
    return filled_values

