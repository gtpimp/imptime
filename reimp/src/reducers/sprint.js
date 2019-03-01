
import {
    ANNOUNCE_CLONING_SPRINT,
    ANNOUNCE_CLONED_SPRINT,
    SET_LAST_SELECTED_SPRINT
} from '../actions/Sprints.js'

const initialState = {
    items_by_id: [],
    loading_item_ids: [],
    saving_item_ids: [],
    invalidated_item_ids: []
}

export default function sprint(state = initialState, action) {

    switch (action.type) {
        case ANNOUNCE_CLONING_SPRINT:
            return Object.assign({}, state,
                                 {cloning_sprint: Object.assign({sprint_id: action.sprint_id})})

        case ANNOUNCE_CLONED_SPRINT:
            return Object.assign({}, state,
                                 {cloning_sprint: Object.assign({},
                                                                state.cloning_sprint,
                                                                {new_sprint_id: action.new_sprint_id})})
        case SET_LAST_SELECTED_SPRINT:
            return Object.assign({}, state,
                                 {last_selected_sprint_id: action.sprint_id })


        default:
            return state
    }
}
