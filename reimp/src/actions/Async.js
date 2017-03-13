export const ASYNC_REFRESH_NOTIFICATION = 'ASYNC_REFRESH_NOTIFICATION'
export const WEBSOCKET_DISCONNECTED = 'WEBSOCKET_DISCONNECTED'
export const WEBSOCKET_CONNECTED = 'WEBSOCKET_CONNECTED'
export const ADD_ASYNC_MSG = 'ADD_ASYNC_MSG'
export const REMOVE_ASYNC_MSG = 'REMOVE_ASYNC_MSG'

export function asyncRefreshNotification(data) {
    const d = JSON.parse(data)
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

export function addAsyncMessage(added_at, msg) {
    return {
        type: ADD_ASYNC_MSG,
        added_at: added_at,
        msg: msg
    }
}

export function removeAsyncMessage(msg) {
    return {
        type: REMOVE_ASYNC_MSG,
        msg: msg
        
    }
}
