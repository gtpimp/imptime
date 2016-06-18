import map from 'lodash/map'
import assign from 'lodash/assign'
import difference from 'lodash/difference'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_ISSUES_LOAD_FAILED,
    ANNOUNCE_ISSUES_LOADED,
    ANNOUNCE_LOADING_ISSUES,
    INVALIDATE_ISSUES
} from '../actions/Issues.js'

const initialState = {
    is_loading: false,
    items_invalidated: true,
    items_by_id: {}
}

export default function issue(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    
    switch (action.type) {
        case INVALIDATE_ISSUES:
	    let item_ids_to_invalidate = action.issue_ids_to_invalidate || []
	    state_copy.items_by_id = difference(state_copy.item_ids,
						item_ids_to_invalidate)
	    state_copy.items_invalidated = true
	    state_copy.is_loading = false
	    return state_copy
        case ANNOUNCE_LOADING_ISSUES:
            return Object.assign({}, state, {
                is_loading: true,
                items_invalidated: false
            })
        case ANNOUNCE_ISSUES_LOADED:
            state_copy = Object.assign({}, state, {
		items_by_id: Object.assign({},
					      state.items_by_id)
	    })
            state_copy.items_by_id = Object.assign({}, assign(state_copy.items_by_id, action.items_by_id))
            return state_copy
        case ANNOUNCE_ISSUES_LOAD_FAILED:
            setErrorMessage("Failed to load issues: " + action.error_message)
            return state;
        default:
            return state
    }
}
