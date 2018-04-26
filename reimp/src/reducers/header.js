import {
    ANNOUNCE_HEADER_HEIGHT,
    ANNOUNCE_NAVBAR_HEIGHT,
    ANNOUNCE_TOOLBAR_HEIGHT
} from '../actions/Header'

const initialState = {
    headerHeight: 0,
    navbarHeight: 0,
    toolbarHeight: 0
}

export default function primary_header(state = initialState, action) {
    switch (action.type) {
        case ANNOUNCE_HEADER_HEIGHT:
            return Object.assign({}, state, {headerHeight: action.headerHeight})
        case ANNOUNCE_NAVBAR_HEIGHT:
            return Object.assign({}, state, {navbarHeight: action.navbarHeight})
        case ANNOUNCE_TOOLBAR_HEIGHT:
            return Object.assign({}, state, {toolbarHeight: action.toolbarHeight})
        default:
            return state
    }
}
