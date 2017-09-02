import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import without from 'lodash/without'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_ESTIMATE_SUMMARY_LOAD_FAILED,
    ANNOUNCE_ESTIMATE_SUMMARY_LOADED,
    ANNOUNCE_LOADING_ESTIMATE_SUMMARY,
    INVALIDATE_ESTIMATE_SUMMARY,
} from '../actions/EstimateSummary.js'

const initialState = {
    items_by_sprint_id: {},
    loading_sprint_ids: []
}

export default function estimate_summary(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let new_items_by_sprint_id = null

    switch (action.type) {
        case INVALIDATE_ESTIMATE_SUMMARY:
            return Object.assign({}, state, {items_by_sprint_id: without(state.items_by_sprint_id, action.sprint_id_to_invalidate)})

        case ANNOUNCE_LOADING_ESTIMATE_SUMMARY:
	    return Object.assign({}, state, {
		loading_sprint_ids: union(state.loading_sprint_ids, [action.sprint_id_to_load])
	    })
        case ANNOUNCE_ESTIMATE_SUMMARY_LOADED:
            state_copy = Object.assign({}, state, {
		loading_sprint_ids: Object.assign({},
						  difference(state.loading_sprint_ids || [],
							     [action.sprint_id])),
		items_by_sprint_id: Object.assign({}, state.items_by_sprint_id)
	    })
            state_copy.items_by_sprint_id[action.sprint_id] = action.estimate_summary
            return state_copy
        case ANNOUNCE_ESTIMATE_SUMMARY_LOAD_FAILED:
            setErrorMessage("Failed to load estimate summary: " + action.error_message)
            return state;

        default:
            return state
    }
}
