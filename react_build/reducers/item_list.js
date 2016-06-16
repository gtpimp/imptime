import map from 'lodash/map'
import merge from 'lodash/merge'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_LIST_LOAD_FAILED,
    ANNOUNCE_LIST_LOADED,
    ANNOUNCE_LIST_LOADING,
    INVALIDATE_LIST,
    UPDATE_LIST_PAGINATION,
    UPDATE_LIST_FILTER,
} from '../actions/ItemList.js'

const initialState = {
    is_fetching: false,
    items_invalidated: true,
    visible_item_ids: [],
    received_at: null,
    filter: {},
    pagination: {}
}

export default function item_list(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let context = Object.assign({}, state_copy[action.context_key] || {})
    
    switch (action.type) {
        case INVALIDATE_LIST:
	    state_copy[action.context_key] = Object.assign({}, context, {
                is_fetching: false,
                items_invalidated: true
            })
	    return state_copy
        case ANNOUNCE_LIST_LOADING:
	    state_copy[action.context_key] = Object.assign({}, context, {
                is_fetching: true,
                items_invalidated: false
	    })
	    return state_copy
        case ANNOUNCE_LIST_LOADED:
	    state_copy[action.context_key] = Object.assign({}, context, {
		is_fetching: false,
		received_at: action.received_at,
		visible_item_ids: action.visible_item_ids
	    })
	    return state_copy
        case ANNOUNCE_LIST_LOAD_FAILED:
            setErrorMessage("Failed to load: " + action.error_message)
	    state_copy[action.context_key] = Object.assign({}, context, {
                is_fetching: false,
                items_invalidated: false
	    })
            return state_copy;
	case UPDATE_LIST_PAGINATION:
	    state_copy.pagination = Object.assign({}, state_copy.pagination, action.pagination)
	    return state_copy
	case UPDATE_LIST_FILTER:
	    state_copy.filter = Object.assign({}, state_copy.filter, action.filter)
	    return state_copy
        default:
            return state
    }
}
