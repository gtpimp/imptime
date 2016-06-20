import map from 'lodash/map'
import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_PROJECTS_LOAD_FAILED,
    ANNOUNCE_PROJECTS_LOADED,
    ANNOUNCE_LOADING_PROJECTS,
    INVALIDATE_PROJECTS
} from '../actions/Projects.js'

const initialState = {
    items_by_id: {},
    loading_item_ids: []
}

export default function project(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    
    switch (action.type) {
        case INVALIDATE_PROJECTS:

	    let new_project_ids = Object.assign({}, state.items_by_id)
	    action.project_ids_to_invalidate.map(function(id_to_invalidate) {
		if ( new_project_ids[id_to_invalidate] ) {
		    delete new_project_ids[id_to_invalidate]
		}
	    })
	    return Object.assign({}, state, {items_by_id: new_project_ids})

        case ANNOUNCE_LOADING_PROJECTS:
	    return Object.assign({}, state, {
		loading_item_ids: union(state.loading_item_ids, action.project_ids_to_load)
	    })
        case ANNOUNCE_PROJECTS_LOADED:
            return Object.assign({}, state, {

		loading_item_ids: Object.assign({},
						difference(state.loading_item_ids || [],
							   keys(action.items_by_id))),
		items_by_id: Object.assign({},
					   assign(state.items_by_id, action.items_by_id))
	    })
	    
        case ANNOUNCE_PROJECTS_LOAD_FAILED:
            setErrorMessage("Failed to load projects: " + action.error_message)
            return state;
        default:
            return state
    }
}
