import {
    START_SPRINT_SNAPSHOT_SELECTOR,
    STOP_SPRINT_SNAPSHOT_SELECTOR
} from '../actions/SprintSnapshots'

const initialState = {
    sprint_snapshot_selector_active: false
}

export default function sprint_snapshot(state = initialState, action) {

    switch (action.type) {
        case START_SPRINT_SNAPSHOT_SELECTOR:
            return Object.assign({}, state, { sprint_snapshot_selector_active: true })

        case STOP_SPRINT_SNAPSHOT_SELECTOR:
            return Object.assign({}, state, { sprint_snapshot_selector_active: false })
            
        default:
            return state
    }
}

