import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import without from 'lodash/without'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_COST_SUMMARY_LOAD_FAILED,
    ANNOUNCE_COST_SUMMARY_LOADED,
    ANNOUNCE_LOADING_COST_SUMMARY,
    INVALIDATE_COST_SUMMARY,
} from '../actions/CostSummary.js'

const initialState = {
    items_by_sprint_id: {},
    loading_sprint_ids: []
}

export default function cost_summary(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let new_items_by_sprint_id = null

    switch (action.type) {
        case INVALIDATE_COST_SUMMARY:
            return Object.assign({}, state, {items_by_sprint_id: without(state.items_by_sprint_id, action.sprint_id_to_invalidate)})

        case ANNOUNCE_LOADING_COST_SUMMARY:
	          return Object.assign({}, state, {
		            loading_sprint_ids: union(state.loading_sprint_ids, [action.sprint_id_to_load])
	          })
        case ANNOUNCE_COST_SUMMARY_LOADED:
            state_copy = Object.assign({}, state, {
		            loading_sprint_ids: Object.assign({},
						                                      difference(state.loading_sprint_ids || [],
							                                               [action.sprint_id])),
		            items_by_sprint_id: Object.assign({}, action.cost_summary)
	          })
            action.cost_summary.received_at = action.received_at
            state_copy.items_by_sprint_id[action.sprint_id] = action.cost_summary
            return state_copy
        case ANNOUNCE_COST_SUMMARY_LOAD_FAILED:
            setErrorMessage("Failed to load cost summary: " + action.error_message)
            return state;

        default:
            return state
    }
}
