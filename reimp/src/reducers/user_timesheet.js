import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import without from 'lodash/without'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_USER_TIMESHEETS_LOADED,
    ANNOUNCE_USER_TIMESHEETS_LOAD_FAILED,
    ANNOUNCE_LOADING_USER_TIMESHEETS,
    INVALIDATE_USER_TIMESHEETS,
    INVALIDATE_ALL_USER_TIMESHEETS,
} from '../actions/UserTimesheets.js'

const initialState = {
    items_by_id: {},
    loading_item_ids: [],
    saving_item_ids: []
}

export default function user_timesheet(state = initialState, action) {

    let state_copy = Object.assign({}, state)

    switch (action.type) {
	case INVALIDATE_ALL_USER_TIMESHEETS:
	    return Object.assign({}, state, {items_by_id: null})

        case INVALIDATE_USER_TIMESHEETS:
            return Object.assign({}, state, {items_by_id: without(state.items_by_id, action.user_ids_to_invalidate)})

        case ANNOUNCE_LOADING_USER_TIMESHEETS:
	    return Object.assign({}, state, {
		loading_item_ids: union(state.loading_item_ids, action.user_ids_to_load)
	    })
        case ANNOUNCE_USER_TIMESHEETS_LOADED:
            state_copy = Object.assign({}, state, {
		loading_item_ids: Object.assign({},
						difference(state.loading_item_ids || [],
							   keys(action.items_by_id))),
		items_by_id: Object.assign({},
					   assign(state.items_by_id, action.items_by_id))
	    })
            state_copy.items_by_id = Object.assign({}, assign(state_copy.items_by_id, action.items_by_id))
            return state_copy
            
        case ANNOUNCE_USER_TIMESHEETS_LOAD_FAILED:
            setErrorMessage("Failed to load user timesheets: " + action.error_message)
            return state;

        default:
            return state
    }
}
