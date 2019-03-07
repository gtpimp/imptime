import {
    SET_LAST_SELECTED_PROJECT
} from '../actions/Projects.js'

const initialState = {
}

export default function project(state = initialState, action) {

    switch (action.type) {
        case SET_LAST_SELECTED_PROJECT:
            return Object.assign({}, state,
                                 {last_selected_project_id: action.project_id})

        default:
            return state
    }
}
