from threading import local
from channels import Group
import copy
from collections import OrderedDict
import json
from impasync.refresh_consumer import REFRESH_GROUP_NAME
import logging

logger = logging.getLogger(__name__)
_active = local()

def add_notification(notification):
    try:
        return _active.notifications.append(notification)
    except AttributeError:  # not in a django request
        middleware = MergeAsyncNotificationsMiddleware(None)
        middleware.post_notifications([notification])

class MergeAsyncNotificationsMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _active.notifications = []
        response = self.get_response(request)
        self.post_notifications()
        return response

    def merge_duplicate_notifications(self, notifications):
        merged_notifications = OrderedDict()
        for notification in notifications:
            n_copy = copy.deepcopy(notification)
            del n_copy['created_at']
            del n_copy['modified_at']
            key = json.dumps(n_copy, sort_keys=True)
            merged_notifications[key] = notification
        return merged_notifications.values()

    def post_notifications(self, notifications=None):
        if notifications is None:
            notifications = _active.notifications
            delattr(_active, 'notifications')
            notifications = self.merge_duplicate_notifications(notifications)
        if notifications:
            Group(REFRESH_GROUP_NAME).send({"text":json.dumps(notifications)})
