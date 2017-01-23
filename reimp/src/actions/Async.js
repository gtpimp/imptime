export const ASYNC_REFRESH_NOTIFICATION = 'ASYNC_REFRESH_NOTIFICATION'
export const WEBSOCKET_DISCONNECTED = 'WEBSOCKET_DISCONNECTED'
export const WEBSOCKET_CONNECTED = 'WEBSOCKET_CONNECTED'

export function asyncRefreshNotification(data) {
    const d = (JSON.parse && JSON.parse(data)) || eval(data)
    return {
        type: ASYNC_REFRESH_NOTIFICATION,
        payload: d
    }
}

export function websocketDisconnected() {
    return {
        type: WEBSOCKET_DISCONNECTED
    }
}

export function websocketConnected() {
    return {
        type: WEBSOCKET_CONNECTED
    }
}

