
import { UPDATE_SETTINGS } from '../actions/Settings'

const initialState = {
    configured: false,
    WEBSOCKET_BASE_URL: "wss://localhost:443/refresh",
    API_BASE_URL:"http://localhost:8000/" 
}

export default function settings(state = initialState, action) {

    switch (action.type) {
        case UPDATE_SETTINGS:
            return Object.assign({}, state,
                                 action.new_settings,
                                 {configured: true})
        default:
            return state
    }
    
}
