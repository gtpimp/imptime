#import json
#import decimal
#from django.db.models import QuerySet
from rest_framework.renderers import JSONRenderer

# def _default_dump(obj):
#     if isinstance(obj, decimal.Decimal):
#         return float(obj)
#     elif isinstance(obj, datetime):
        
#     elif isinstance(obj, QuerySet):
#         return []
#     raise TypeError("obj is %s" % type(obj))

def json_dump(obj):
    return JSONRenderer().render(obj)
    #return json.dumps(obj, default=_default_dump)

