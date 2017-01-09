from django.conf import settings
import operator
from lib.date_helper import convert_datetime_to_iso_string
import logging
logger = logging.getLogger(__name__)

from async.middleware import add_notification

class RefreshNotifier(object):

    def notify_model_create(self, obj):
        self._notify(action_type='create', obj=obj)

    def notify_model_update(self, obj):
        self._notify(action_type='update', obj=obj)        

    def notify_model_delete(self, obj):
        self._notify(action_type='delete', obj=obj)        
        
    def _notify(self, action_type, obj):

        if settings.RABBITMQ_REFRESH_QUEUE is None:
            logger.debug("Refresh notification queue disabled")
            return
        
        try:
            model_name = obj.__class__.__name__
            for entity_definition in settings.MODEL_TO_ENTITY_MAPPING.get(model_name, []) or []:

                if entity_definition is None:
                    continue
                if len(entity_definition) != 3:
                    raise Exception("Invalid entity definition: %s" % entity_definition[0])
                entity_name, ref_attrgetter, device_ref_attrgetter = entity_definition

                try:
                    model_ref = operator.attrgetter(ref_attrgetter)(obj)
                except AttributeError, ex:
                    continue

                if device_ref_attrgetter:
                    try:
                        device_ref = operator.attrgetter(device_ref_attrgetter)(obj)
                    except AttributeError, ex:
                        continue
                else:
                    device_ref = None

                post_data = { 'action_type': action_type,
                              'entity': entity_name,
                              'model_ref': model_ref,
                              'device_ref': device_ref,
                              'created_at': convert_datetime_to_iso_string(obj.created_at),
                              'modified_at': convert_datetime_to_iso_string(obj.modified_at) }

                add_notification(post_data)
                logger.info("Notified about %s" % post_data)
        except Exception, ex:
            logger.exception(ex)
            logger.error("Failed to notify the refresh queue about")


