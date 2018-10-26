import {
    START_MIEN_CONFIGURER,
    STOP_MIEN_CONFIGURER
} from '../actions/Mien'

const initialState = {
    mien_configurer_active: false
}

export default function mien(state = initialState, action) {

    switch (action.type) {
        case START_MIEN_CONFIGURER:
            return Object.assign({}, state, { mien_configurer_active: true })

        case STOP_MIEN_CONFIGURER:
            return Object.assign({}, state, { mien_configurer_active: false })
            
        default:
            return state
    }
}

export function customUpdateMienHeaders(entity_state, action) {
    const mien = Object.assign({}, entity_state.items_by_id[action.params.mien_id])
    mien[action.params.name] = action.params.headers
    entity_state.items_by_id = Object.assign({}, entity_state.items_by_id,
                                             {[action.params.mien_id]:mien})
    return entity_state
}

