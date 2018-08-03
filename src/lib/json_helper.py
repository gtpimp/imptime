import json
import decimal
from django.db.models import QuerySet

def _default_dump(obj):
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    elif isinstance(obj, QuerySet):
        return []
    raise TypeError

def json_dump(obj):
    return json.dumps(obj, default=_default_dump)

