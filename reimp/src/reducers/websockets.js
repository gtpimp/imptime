import {
    WEBSOCKET_DISCONNECTED,
    WEBSOCKET_CONNECTED
} from '../actions/Async'

const initialState = {
    isConnected: true
}

export default function websockets(state = initialState, action) {
    switch (action.type) {
        case WEBSOCKET_CONNECTED:
            return Object.assign({}, state, {isConnected: true})
        case WEBSOCKET_DISCONNECTED:
            return Object.assign({}, state, {isConnected: false})
        default:
            return state
    }
}
