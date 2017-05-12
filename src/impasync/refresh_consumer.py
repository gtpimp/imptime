from channels import Group
import logging
logger = logging.getLogger(__name__)

REFRESH_GROUP_NAME = "refresh"

def ws_message(message):
    payload = {"text":"this is a ws placeholder message"}
    logger.info("Received async message from client: %s" % message)
    Group(REFRESH_GROUP_NAME).send(payload)

def ws_add(message):
    logger.debug("Opened websocket connection for client: %s %s" % (message['client'], message['reply_channel']))
    message.reply_channel.send({"accept": True})
    Group(REFRESH_GROUP_NAME).add(message.reply_channel)

def ws_disconnect(message):
    logger.debug("Disconnected websocket connection for client: %s" % (message['reply_channel']))
    Group(REFRESH_GROUP_NAME).discard(message.reply_channel)
