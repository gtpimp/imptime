from django.conf import settings
import operator
from lib.date_helper import convert_datetime_to_iso_string
import logging
logger = logging.getLogger(__name__)

from async.middleware import add_notification

class RefreshNotifier(object):

    def notify_model_create(self, obj, params=None):
        self._notify('create', obj, params)

    def notify_model_update(self, obj, params=None):
        self._notify('update', obj, params)        

    def notify_model_delete(self, obj, params=None):
        self._notify('delete', obj, params)        
        
    def _notify(self, action_type, obj, params):

        entity_name = obj.__class__.__name__.lower()
        if entity_name == 'business':
            entity_name = 'project'
        elif entity_name == 'project':
            entity_name = 'sprint'
        
        try:
            post_data = {'entity_name': entity_name,
                         'entity_ref': obj.id,
                         'created_at': convert_datetime_to_iso_string(obj.created),
                         'modified_at': convert_datetime_to_iso_string(obj.modified),
                         'params': params}

            add_notification(post_data)
            logger.info("Notified about %s" % post_data)
        except Exception, ex:
            logger.exception(ex)
            logger.error("Failed to notify the refresh queue about")
