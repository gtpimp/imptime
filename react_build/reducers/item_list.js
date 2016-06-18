import map from 'lodash/map'
import merge from 'lodash/merge'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_LIST_LOADED,
    ANNOUNCE_LIST_LOADING,
    ANNOUNCE_LIST_LOAD_FAILED,
    ANNOUNCE_MATCHING_ITEMS_LOADED,
    ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED,
    ANNOUNCE_MATCHING_ITEMS_LOADING,
    INVALIDATE_LIST,
    UPDATE_LIST_PAGINATION,
    UPDATE_LIST_FILTER,
    UPDATE_LIST_SELECTION
} from '../actions/ItemList.js'

const initialState = {}

const item_list_template = {
    // Don't put any objects in here, only primitives
    is_loading: false,
    items_invalidated: true,
    visible_item_ids: null,
    received_at: null,
    filter: null,
    pagination: null
}

export default function item_list(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let l = Object.assign({}, item_list_template, state_copy[action.list_key] || {})
    
    switch (action.type) {
        case INVALIDATE_LIST:
	    state_copy[action.list_key] = Object.assign({}, l, {
                is_loading: false,
                items_invalidated: true
            })
	    return state_copy
        case ANNOUNCE_LIST_LOADING:
	    state_copy[action.list_key] = Object.assign({}, l, {
                is_loading: true,
                items_invalidated: false
	    })
	    return state_copy
        case ANNOUNCE_MATCHING_ITEMS_LOADING:
	    state_copy[action.list_key] = Object.assign({}, l, {
                // is_loading: true
	    })
	    return state_copy
	case ANNOUNCE_MATCHING_ITEMS_LOADED:
	    state_copy[action.list_key] = Object.assign({}, l, {
                // is_loading: false
	    })
	    return state_copy
        case ANNOUNCE_LIST_LOADED:
	    state_copy[action.list_key] = Object.assign({}, l, {
		is_loading: false,
		received_at: action.received_at,
		visible_item_ids: action.visible_item_ids,
		pagination: action.pagination
	    })
	    return state_copy
        case ANNOUNCE_MATCHING_ITEMS_LOADED:
	    state_copy[action.list_key] = Object.assign({}, l, {
		is_loading: false,
		received_at: action.received_at,
	    })
	    return state_copy
        case ANNOUNCE_LIST_LOAD_FAILED:
            setErrorMessage("Failed to load: " + action.error_message)
	    state_copy[action.list_key] = Object.assign({}, l, {
                is_loading: false,
                items_invalidated: false
	    })
            return state_copy;
        case ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED:
            setErrorMessage("Failed to load matching items: " + action.error_message)
	    state_copy[action.list_key] = Object.assign({}, l, {
                is_loading: false,
                items_invalidated: false
	    })
            return state_copy;
	case UPDATE_LIST_PAGINATION:
	    state_copy[action.list_key] = Object.assign({}, l, {
		pagination: Object.assign({}, state_copy.pagination, action.pagination)
	    })
	    return state_copy
	case UPDATE_LIST_FILTER:
	    state_copy[action.list_key] = Object.assign({}, l, {
		filter: Object.assign({}, state_copy.filter, action.filter)
	    })
	    return state_copy
	case UPDATE_LIST_SELECTION:
	    state_copy[action.list_key] = Object.assign({}, l, {
		selected_ids: action.selected_ids})
	    return state_copy
        default:
            return state
	    
    }
}
