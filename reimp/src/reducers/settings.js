import {
    UPDATE_SETTINGS,
} from '../actions/Settings'
import {SET_MIEN} from '../actions/Mien'

const page_template = {
    // Don't put any objects in here, only primitives
    toolbars: null,
    settings: null,
    selection: null,
    sidebars: null,
    header_list: null
}

const initialState = {
    configured: false,
    WEBSOCKET_BASE_URL: "wss://not/configured",
    API_BASE_URL: "http://not/configured/"
}

export default function settings(state = initialState, action) {

    let state_copy
    let l

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
