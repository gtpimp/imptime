import { assign, keys, union, difference, without, map } from 'lodash'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOADED,
    ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOAD_FAILED,
    ANNOUNCE_LOADING_VISUAL_SPEC_DOCUMENTS,
    INVALIDATE_VISUAL_SPEC_DOCUMENTS,
    INVALIDATE_ALL_VISUAL_SPEC_DOCUMENTS,
    ANNOUNCE_VISUAL_SPEC_DOCUMENTS_SAVED,
    ANNOUNCE_VISUAL_SPEC_DOCUMENTS_SAVING
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

	case ANNOUNCE_VISUAL_SPEC_DOCUMENTS_SAVING:
	    const visual_spec_document_ids = action.visual_spec_document_ids

            const state_clone = Object.assign({}, state, {
		items_by_id: Object.assign(
		    {},
		    state.items_by_id
                ),
		saving_item_ids: union(state.saving_item_ids, visual_spec_document_ids)
	    })

	    const new_visual_spec_document_props = {}
	    new_visual_spec_document_props[action.field_name] = action.new_value
            map(visual_spec_document_ids, function(visual_spec_document_id, index) {
                state_clone.items_by_id[visual_spec_document_id] = Object.assign({}, state.items_by_id[visual_spec_document_id],
		                                                                 new_visual_spec_document_props)
            })
            return state_clone

	case ANNOUNCE_VISUAL_SPEC_DOCUMENTS_SAVED:
	    return Object.assign({}, state,
				 {saving_item_ids: difference(state.saving_item_ids || [],
							      action.visual_spec_document_ids)
				 })
            
        default:
            return state
    }
}
