import map from 'lodash/map'
import assign from 'lodash/assign'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_PROJECTS_LOAD_FAILED,
    ANNOUNCE_PROJECTS_LOADED,
    ANNOUNCE_LOADING_PROJECTS,
    INVALIDATE_PROJECTS
} from '../actions/Projects.js'

const initialState = {
    isFetching: false,
    items_invalidated: true,
    projects_by_id: {}
}

export default function projects(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    
    switch (action.type) {
        case INVALIDATE_PROJECTS:
	    let project_ids_to_invalidate = action.project_ids
	    let projects_by_id = difference(context.item_ids, project_ids_to_invalidate)
	    state_copy['projects_by_id'] = projects_by_id
	    state_copy['items_invalidated'] = true
	    state_copy['isFetching'] = false
	    return state_copy
        case ANNOUNCE_LOADING_PROJECTS:
            return Object.assign({}, state, {
                isFetching: true,
                items_invalidated: false
            })
        case ANNOUNCE_PROJECTS_LOADED:
            state_copy = Object.assign({}, state, {
		projects_by_id: Object.assign({},
					      state.projects_by_id)
	    })
            state_copy.projects_by_id = Object.assign({}, assign(state_copy.projects_by_id, action.projects_by_id)
            return state_copy
        case ANNOUNCE_PROJECTS_LOAD_FAILED:
            setErrorMessage("Failed to load projects: " + action.error_message)
            return state;
        default:
            return state
    }
}



