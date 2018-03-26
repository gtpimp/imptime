import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import without from 'lodash/without'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_SUMMARIES_LOADED,
    ANNOUNCE_SUMMARIES_LOAD_FAILED,
    ANNOUNCE_LOADING_SUMMARIES,
    INVALIDATE_SUMMARIES,
    INVALIDATE_ALL_SUMMARIES,
} from '../actions/WorkSummary.js'

const initialState = {
    items_by_id: {},
    loading_item_ids: [],
    saving_item_ids: [],
    all_sprint_ids: [],
    all_user_ids: []
}

export default function summary(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let new_items_by_id = null

    switch (action.type) {
	case INVALIDATE_ALL_SUMMARIES:
	          return Object.assign({}, state, {items_by_id: null})

        case INVALIDATE_SUMMARIES:
            return Object.assign({}, state, {items_by_id: without(state.items_by_id, action.project_ids_to_invalidate)})

        case ANNOUNCE_LOADING_SUMMARIES:
	          return Object.assign({}, state, {
		            loading_item_ids: union(state.loading_item_ids, action.project_ids_to_load)
	          })
        case ANNOUNCE_SUMMARIES_LOADED:
            state_copy = Object.assign({}, state, {
		loading_item_ids: Object.assign({},
						difference(state.loading_item_ids || [],
							   keys(action.items_by_id))),
		items_by_id: Object.assign({},
					   assign(state.items_by_id, action.items_by_id)),
                all_sprint_ids: action.all_sprint_ids,
                all_project_ids: action.all_project_ids,
                all_user_ids: action.all_user_ids
	    })
            state_copy.items_by_id = Object.assign({}, assign(state_copy.items_by_id, action.items_by_id))
            return state_copy
            
        case ANNOUNCE_SUMMARIES_LOAD_FAILED:
            setErrorMessage("Failed to load projects summaries: " + action.error_message)
            return state;

        default:
            return state
    }
}
