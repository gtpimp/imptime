import {
    ANNOUNCE_HEADER_HEIGHT
} from '../actions/Header'

const initialState = {
    headerHeight: 0
}

export default function PrimaryHeader(state = initialState, action) {
    switch (action.type) {
        case ANNOUNCE_HEADER_HEIGHT:
            return Object.assign({}, state, {headerHeight: action.headerHeight})
        default:
            return state
    }
}
