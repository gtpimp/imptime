import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import without from 'lodash/without'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOADED,
    ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOAD_FAILED,
    ANNOUNCE_LOADING_VISUAL_SPEC_DOCUMENTS,
    INVALIDATE_VISUAL_SPEC_DOCUMENTS,
    INVALIDATE_ALL_VISUAL_SPEC_DOCUMENTS,
} from '../actions/VisualSpecDocuments.js'

const initialState = {
    items_by_id: {},
    loading_item_ids: [],
    saving_item_ids: [],
    all_sprint_ids: [],
    all_user_ids: []
}

export default function visual_spec_document(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let new_items_by_id = null

    switch (action.type) {
	case INVALIDATE_ALL_VISUAL_SPEC_DOCUMENTS:
	          return Object.assign({}, state, {items_by_id: null})

        case INVALIDATE_VISUAL_SPEC_DOCUMENTS:
            return Object.assign({}, state, {items_by_id: without(state.items_by_id, action.visual_spec_document_ids_to_invalidate)})

        case ANNOUNCE_LOADING_VISUAL_SPEC_DOCUMENTS:
	          return Object.assign({}, state, {
		            loading_item_ids: union(state.loading_item_ids, action.visual_spec_document_ids_to_load)
	          })
        case ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOADED:
            state_copy = Object.assign({}, state, {
		loading_item_ids: Object.assign({},
						difference(state.loading_item_ids || [],
							   keys(action.items_by_id))),
		items_by_id: Object.assign({},
					   assign(state.items_by_id, action.items_by_id)),
	    })
            return state_copy
            
        case ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOAD_FAILED:
            setErrorMessage("Failed to load visual spec documents: " + action.error_message)
            return state;

        default:
            return state
    }
}
