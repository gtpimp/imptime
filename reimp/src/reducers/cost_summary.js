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
    items_by_id: [],
    loading_item_ids: [],
    saving_item_ids: []
}

export default function cost_summary(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let new_items_by_id = null

    switch (action.type) {
        case INVALIDATE_COST_SUMMARY:
            return Object.assign({}, state, {items_by_id: without(state.items_by_id, action.cost_summary_to_invalidate)})

        case ANNOUNCE_LOADING_COST_SUMMARY:
	          return Object.assign({}, state, {
		            loading_item_ids: union(state.loading_item_ids, action.cost_summary_to_load)
	          })
        case ANNOUNCE_COST_SUMMARY_LOADED:
            state_copy = Object.assign({}, state, {
		            loading_item_ids: Object.assign({},
						                                    difference(state.loading_item_ids || [],
							                                             keys(action.items_by_id))),
		            items_by_id: Object.assign({},
					                                 assign(state.items_by_id, action.items_by_id))
	          })
            state_copy.items_by_id = Object.assign({}, assign(state_copy.items_by_id, action.items_by_id))
            return state_copy
        case ANNOUNCE_COST_SUMMARY_LOAD_FAILED:
            setErrorMessage("Failed to load cost summary: " + action.error_message)
            return state;

        default:
            return state
    }
}
