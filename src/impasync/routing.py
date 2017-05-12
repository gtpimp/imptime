from channels.routing import route
from impasync.refresh_consumer import ws_message, ws_add, ws_disconnect

channel_routing = [
    route("websocket.connect", ws_add),#, path=r"^/refresh/$"),
    route("websocket.disconnect", ws_disconnect),
    route("websocket.receive", ws_message),#, path=r"^/refresh/$")
]
