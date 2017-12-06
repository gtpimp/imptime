import {
    MAINTENANCE_MODE_ACTIVE,
    MAINTENANCE_MODE_INACTIVE
} from '../actions/Maintenance'

const initialState = {
    is_active: false
}

export default function maintenance(state=initialState, action) {
    switch (action.type) {
        case MAINTENANCE_MODE_ACTIVE:
            return Object.assign({}, state, {is_active: true})
        case MAINTENANCE_MODE_INACTIVE:
            return Object.assign({}, state, {is_active: false})
        default:
            return state
    }
}

