
def convert_to_decimal(v):
    try:
        return float(v)
    except ValueError:
        v = v.strip()
        if ':' in v:
            hours, minutes = v.split(":")
            return float(hours) + float(minutes)/60
        else:
            raise
        
    
