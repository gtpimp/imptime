import {
    UPDATE_SETTINGS,
} from '../actions/Settings'
import {SET_MIEN} from '../actions/Mien'

const initialState = {
    configured: false,
    WEBSOCKET_BASE_URL: "wss://not/configured",
    API_BASE_URL: "http://not/configured/",
    mien: "dev"
}

export default function settings(state = initialState, action) {

    let state_copy

    switch (action.type) {
        case UPDATE_SETTINGS:
            return Object.assign({}, state,
                                 action.new_settings,
                                 {configured: true})

        case SET_MIEN:
            state_copy = Object.assign({}, state, {mien: action.mien})
            return state_copy

        default:
            return state
    }

}
