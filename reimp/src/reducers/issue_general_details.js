import assign from 'lodash/assign'
import keys from 'lodash/keys'
import difference from 'lodash/difference'
import union from 'lodash/union'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_ISSUE_GENERAL_DETAILS_LOAD_FAILED,
    ANNOUNCE_ISSUE_GENERAL_DETAILS_LOADED,
    ANNOUNCE_LOADING_ISSUE_GENERAL_DETAILS,
    INVALIDATE_ISSUE_GENERAL_DETAILS
} from '../actions/IssueGeneralDetails.js'

const initialState = {
    items_by_id: {},
    loading_item_ids: []
}

export default function issue(state = initialState, action) {
    
    switch (action.type) {
        case INVALIDATE_ISSUE_GENERAL_DETAILS:
	    return Object.assign({}, state, {
		items_by_id: difference(state.item_ids,
					action.issue_ids_to_invalidate)})
        case ANNOUNCE_LOADING_ISSUE_GENERAL_DETAILS:
            return Object.assign({}, state, {
                loading_item_ids: union(state.loading_item_ids, action.issue_ids_to_load)
	    })
        case ANNOUNCE_ISSUE_GENERAL_DETAILS_LOADED:
            return Object.assign({}, state, {
	        loading_item_ids: Object.assign({},
					        difference(state.loading_item_ids || [],
						           keys(action.items_by_id))),
	        items_by_id: Object.assign({},
					   assign(state.items_by_id, action.items_by_id))
	    })
        case ANNOUNCE_ISSUE_GENERAL_DETAILS_LOAD_FAILED:
            setErrorMessage("Failed to load issue general details: " + action.error_message)
            return state;

        default:
            return state
    }
}
