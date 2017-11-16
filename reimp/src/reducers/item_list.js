import difference from 'lodash/difference'
import { union } from 'lodash'
import { setErrorMessage } from '../actions/Error'

import {
    INIT_LIST,
    ANNOUNCE_LIST_LOADED,
    ANNOUNCE_LIST_LOADING,
    ANNOUNCE_LIST_LOAD_FAILED,
    ANNOUNCE_MATCHING_ITEMS_LOADED,
    ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED,
    ANNOUNCE_MATCHING_ITEMS_LOADING,
    SET_ITEMS_FLAG,
    INVALIDATE_LIST,
    UPDATE_LIST_PAGINATION,
    UPDATE_LIST_FILTER,
    CLEAR_LIST_FILTER_OPTION,
    UPDATE_LIST_FORMAT,
    UPDATE_LIST_SELECTION,
    HIGHLIGHT_LIST_SELECTION,
    UPDATE_LIST_DISPLAY_MODE,
    UPDATE_VISIBLE_ITEM_IDS,
    SET_CURSOR_ITEM
} from '../actions/ItemList.js'

const initialState = {}

const item_list_template = {
    // Don't put any objects in here, only primitives
    is_loading: false,
    items_invalidated: true,
    visible_item_ids: null,
    loading_matching_items: false,
    received_at: null,
    filter: null,
    pagination: null
}

export default function item_list(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let l = Object.assign({}, item_list_template, state_copy[action.list_key] || {})
    
    switch (action.type) {
        case INIT_LIST:
	    state_copy[action.list_key] = Object.assign({}, l)
	    return state_copy
	
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
	case ANNOUNCE_LIST_LOADED:
	    state_copy[action.list_key] = Object.assign({}, l, {
		is_loading: false,
		received_at: action.received_at,
		visible_item_ids: action.visible_item_ids,
		pagination: action.pagination
	    })
	    return state_copy
        case ANNOUNCE_LIST_LOAD_FAILED:
            setErrorMessage("Failed to load: " + action.error_message)
	    state_copy[action.list_key] = Object.assign({}, l, {
                is_loading: false,
                items_invalidated: false
	    })
            return state_copy;
        case ANNOUNCE_MATCHING_ITEMS_LOADING:
	    state_copy[action.list_key] = Object.assign({}, l, {
                loading_matching_items: true
	    })
	    return state_copy
        case ANNOUNCE_MATCHING_ITEMS_LOADED:
	    state_copy[action.list_key] = Object.assign({}, l, {
		is_loading: false,
		loading_matching_items: false,
		received_at: action.received_at,
	    })
	    return state_copy
        case ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED:
            setErrorMessage("Failed to load matching items: " + action.error_message)
	    state_copy[action.list_key] = Object.assign({}, l, {
                is_loading: false,
		loading_matching_items: false,
                items_invalidated: false
	    })
            return state_copy;
	case UPDATE_LIST_PAGINATION:
	    state_copy[action.list_key] = Object.assign({}, l, {
		pagination: Object.assign({}, (state_copy[action.list_key] || {}).pagination, action.pagination)
	    })
	    return state_copy
	case UPDATE_LIST_FILTER:
	    state_copy[action.list_key] = Object.assign({}, l, {
		filter: Object.assign({}, (state_copy[action.list_key] || {}).filter, action.filter)
	    })
	    return state_copy
        case CLEAR_LIST_FILTER_OPTION:
	    state_copy[action.list_key] = Object.assign({}, l, {
		filter: Object.assign({}, (state_copy[action.list_key] || {}).filter)
	    })
            delete state_copy[action.list_key].filter[action.filter_option]
	    return state_copy
            
        case UPDATE_LIST_FORMAT:
	    state_copy[action.list_key] = Object.assign({}, l, {
		format: Object.assign({}, (state_copy[action.list_key] || {}).format, action.format)
	    })
	    return state_copy            
	case UPDATE_LIST_SELECTION:
	    state_copy[action.list_key] = Object.assign({}, l, {
		selected_ids: action.selected_ids})
	    return state_copy
        case HIGHLIGHT_LIST_SELECTION:
	    state_copy[action.list_key] = Object.assign({}, l, {
		highlighted_ids: action.highlighted_ids})
	    return state_copy
	case UPDATE_LIST_DISPLAY_MODE:
	    state_copy[action.list_key] = Object.assign({}, l, {
		display_mode: action.display_mode})
	    return state_copy
        case SET_ITEMS_FLAG:

            const flag_name = "flag_" + action.flag_name
            const flag_value = action.flag_value
            
            var flag_ids = l[flag_name] || []
            if ( flag_value === false ) {
                flag_ids = difference(flag_ids, action.selected_ids)
            } else {
                flag_ids = union(flag_ids, action.selected_ids)
            }
            state_copy[action.list_key] = Object.assign({}, l)
            state_copy[action.list_key][flag_name] = flag_ids
	    return state_copy

        case UPDATE_VISIBLE_ITEM_IDS:
            state_copy[action.list_key] = Object.assign({}, l, {
                visible_item_ids: action.visible_item_ids})
            return state_copy

        case SET_CURSOR_ITEM:
            state_copy[action.list_key] = Object.assign({}, l, {
                cursor_item_id: action.cursor_item_id})
            return state_copy
        
        default:
            return state
    }
}
