import map from 'lodash/map'
import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_SPRINTS_LOAD_FAILED,
    ANNOUNCE_SPRINTS_LOADED,
    ANNOUNCE_LOADING_SPRINTS,
    INVALIDATE_SPRINTS
} from '../actions/Sprints.js'

const initialState = {
    is_loading: false,
    loading_item_ids: []
}

export default function sprint(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    
    switch (action.type) {
        case INVALIDATE_SPRINTS:

	    let new_sprint_ids = Object.assign({}, state.items_by_id)
	    action.sprint_ids_to_invalidate.map(function(id_to_invalidate) {
		if ( new_sprint_ids[id_to_invalidate] ) {
		    delete new_sprint_ids[id_to_invalidate]
		}
	    })
	    return Object.assign({}, state, {items_by_id: new_sprint_ids})
        case ANNOUNCE_LOADING_SPRINTS:
	    return Object.assign({}, state, {
		loading_item_ids: union(state.loading_item_ids, action.sprint_ids_to_load)
	    })            
        case ANNOUNCE_SPRINTS_LOADED:
            state_copy = Object.assign({}, state, {
		loading_item_ids: Object.assign({},
						difference(state.loading_item_ids || [],
							   keys(action.items_by_id))),
		items_by_id: Object.assign({},
					      state.items_by_id)
	    })
            state_copy.items_by_id = Object.assign({}, assign(state_copy.items_by_id, action.items_by_id))
            return state_copy
        case ANNOUNCE_SPRINTS_LOAD_FAILED:
            setErrorMessage("Failed to load sprints: " + action.error_message)
            return state;
        default:
            return state
    }
}
