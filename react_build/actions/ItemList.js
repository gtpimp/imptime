import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import map from 'lodash/map'

export const ANNOUNCE_LIST_LOADED = 'ANNOUNCE_LIST_LOADED'
export const ANNOUNCE_LIST_LOAD_FAILED = 'ANNOUNCE_LIST_LOAD_FAILED'
export const ANNOUNCE_LIST_LOADING = 'ANNOUNCE_LIST_LOADING'
export const ANNOUNCE_MATCHING_ITEMS_LOADED = 'ANNOUNCE_MATCHING_ITEMS_LOADED'
export const ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED = 'ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED'
export const ANNOUNCE_MATCHING_ITEMS_LOADING = 'ANNOUNCE_MATCHING_ITEMS_LOADING'
export const INVALIDATE_LIST = 'INVALIDATE_LIST'
export const UPDATE_LIST_PAGINATION = 'UPDATE_LIST_PAGINATION'
export const UPDATE_LIST_FILTER = 'UPDATE_LIST_FILTER'

export function update_list_pagination(list_key, new_pagination) {
    return {
        type: UPDATE_LIST_PAGINATION,
        list_key: list_key,
        new_pagination: new_pagination
    }
}

export function update_list_filter(list_key, new_filter) {
    return {
        type: UPDATE_LIST_FILTER,
        list_key: list_key,
        new_filter: new_filter
    }
}

export function invalidateList(list_key) {
    return {
        type: INVALIDATE_LIST,
	list_key: list_key
    }
}

function announceListLoading(list_key) {
    return {
        type: ANNOUNCE_LIST_LOADING,
	list_key: list_key
    }
}

function announceMatchingItemsLoading(list_key) {
    return {
        type: ANNOUNCE_MATCHING_ITEMS_LOADING,
	list_key: list_key
    }
}

function announceListLoaded(list_key, items) {

    return {
        type: ANNOUNCE_LIST_LOADED,
        items_by_id: map(items, 'id'),
	list_key: list_key,
        received_at: Date.now()
    }
}

function announceMatchingItemsLoaded(list_key) {

    return {
        type: ANNOUNCE_MATCHING_ITEMS_LOADED,
        list_key: list_key,
        received_at: Date.now()
    }
}

function announceListLoadFailed(list_key,error_message) {
    return {
        type: ANNOUNCE_LIST_LOAD_FAILED,
	list_key: list_key,
        error_message: error_message,
        received_at: Date.now()
    }
}

function announceMatchingItemsLoadFailed(list_key, error_message) {
    return {
        type: ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED,
	list_key: list_key,
        error_message: error_message,
        received_at: Date.now()
    }
}

function fetchListAndItems(state, list_key,
			   matching_items_key, matching_items_promise_func) {
    return dispatch => {
        dispatch(announceListLoading(list_key))

	const l = state[list_key] || {}
	const pagination = l.pagination || {}
	const filter = l.filter || {}
	
        return impfetch('/imp/' + matching_items_key, {params:{pagination:pagination, filter:filter}})
            .then(response => response.json())
            .then(json => {

		if (json.status != 'success') {
                    dispatch(announceListLoadFailed(list_key, json.error_message))
                } else {
		    const required_item_ids = json.visible_item_ids || []
		    const matching_items = state[matching_items_key] || {}
		    const matching_item_ids = keys(matching_items.items_by_id || {}) // magic, assumes the specific reducer will use 'items_by_id' as well
		    const unmatching_item_ids = difference(required_item_ids, matching_item_ids)

		    if ( unmatching_item_ids.length == 0 ) {
			dispatch(announceListLoaded(list_key, json.payload))
		    } else {
			matching_items_promise_func(dispatch, unmatching_item_ids)
			    .then(() => {
				announceMatchingItemsLoaded(list_key)
				dispatch(announceListLoaded(list_key, json.payload))
			    })
			    .catch(function (error) {
				dispatch(announceMatchingItemsLoadFailed(list_key, "Failed to load list: " + error.message))
			    })
		    }
		}		
            })
	    .catch(function (error) {
                dispatch(announceListLoadFailed(list_key,"Failed to load list: " + error.message))
            })
    }
}

function shouldFetchList(state, list_key) {

    const l = state[list_key] || {}
    if ( l.items_invalidated ) {
	return true
    }
    if( l.is_fetching ) {
	return false
    }
    if ( ! l.visible_item_ids ) {
	return true
    }
}

function shouldFetchMatchingItems(state, list_key, matching_items_key) {
    // note: only call this function after shouldFetchList returns false
    const l = state[list_key] || []
    const required_item_ids = l.visible_item_ids || []

    const matching_items = state[matching_items_key]
    if ( ! matching_items ) {
	return true
    }
    if ( matching_items.is_fetching ) {
	return false
    }
    if ( matching_items.items_invalidated ) {
	return true
    }
    if ( ! matching_items.items_by_id ) {
	return true
    }
    const matching_item_ids = keys(matching_items.items_by_id) // magic, assumes the specific reducer will use 'items_by_id' as well
    const unmatching_item_ids = difference(required_item_ids, matching_item_ids)
    
    if ( unmatching_item_ids.length > 0 ) {
	return true
    }
    return false
}

export function fetchListIfNeeded(list_key,
				  matching_items_key, matching_items_promise_func) {
    return (dispatch, getState) => {
        const state = getState()

        if (shouldFetchList(state, list_key) || shouldFetchMatchingItems(state, list_key, matching_items_key)) {
	    return dispatch(fetchListAndItems(state, list_key,
					      matching_items_key, matching_items_promise_func))
        }
    }
}
