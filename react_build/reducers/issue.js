import map from 'lodash/map'
import assign from 'lodash/assign'
import difference from 'lodash/difference'
import union from 'lodash/union'
import keys from 'lodash/keys'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_ISSUES_LOAD_FAILED,
    ANNOUNCE_ISSUES_LOADED,
    ANNOUNCE_LOADING_ISSUES,
    INVALIDATE_ISSUES
} from '../actions/Issues.js'

const initialState = {
    items_by_id: {},
    loading_item_ids: []
}

export default function issue(state = initialState, action) {
    
    switch (action.type) {
        case INVALIDATE_ISSUES:

	    let new_issue_ids = Object.assign({}, state.items_by_id)
	    action.issue_ids_to_invalidate.map(function(id_to_invalidate) {
					       if ( new_issue_ids[id_to_invalidate] ) {
						   delete new_issue_ids[id_to_invalidate]
					       }
	    })
	    
	    return Object.assign({}, state, {items_by_id: new_issue_ids})
        case ANNOUNCE_LOADING_ISSUES:
            return Object.assign({}, state, {
		loading_item_ids: union(state.loading_item_ids, action.issue_ids_to_load)
	    })
	    
        case ANNOUNCE_ISSUES_LOADED:
            return Object.assign({}, state, {

		loading_item_ids: Object.assign({},
						difference(state.loading_item_ids || [],
							   keys(action.items_by_id))),
		items_by_id: Object.assign({},
					   assign(state.items_by_id, action.items_by_id))
	    })
        case ANNOUNCE_ISSUES_LOAD_FAILED:
            setErrorMessage("Failed to load issues: " + action.error_message)
            return state;

        default:
            return state
    }
}
