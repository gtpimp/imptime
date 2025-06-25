from django.conf import settings
from impasync.middleware import add_notification
from lib.date_helper import convert_datetime_to_iso_string
import operator

import logging
logger = logging.getLogger(__name__)


class RefreshNotifier(object):

    def notify_model_create(self, obj, params=None, name=None):
        self._notify('create', obj, params, name=name)

    def notify_model_update(self, obj, params=None, name=None):
        self._notify('update', obj, params, name=name)

    def notify_model_delete(self, obj, params=None, name=None):
        self._notify('delete', obj, params, name=name)

    def _notify(self, action_type, obj, params, name=None):
        entity_name = name or obj.__class__.__name__.lower()
        if entity_name == 'business':
            entity_name = 'project'
        elif entity_name == 'project':
            entity_name = 'sprint'
        elif entity_name == 'businessinvite':
            entity_name = 'projectinvite'

        if params:
            for k, v in params.items():
                if 'project' in k:
                    params[k.replace("project", "sprint")] = params.pop(k)
                if 'businesses' in k:
                    params[k.replace("businesses", "projects")] = params.pop(k)
                elif 'business' in k:
                    params[k.replace("business", "project")] = params.pop(k)


        try:
            created_at = convert_datetime_to_iso_string(obj.created) if hasattr(obj, 'created') else None
            modified_at = convert_datetime_to_iso_string(obj.modified) if hasattr(obj, 'modified') else None
            
            post_data = {'entity_name': entity_name,
                         'entity_ref': obj.id,
                         'action_type': action_type,
                         'created_at': created_at,
                         'modified_at': modified_at,
                         'params': params}

            add_notification(post_data)
            logger.info("Notified about %s" % post_data)
        except Exception as ex:
            logger.exception(ex)
            logger.error("Failed to notify the refresh queue about")
