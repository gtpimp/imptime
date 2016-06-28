import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import union from 'lodash/union'
import map from 'lodash/map'
import { reorderSprints } from './Sprints'

export const ANNOUNCE_LIST_LOADED = 'ANNOUNCE_LIST_LOADED'
export const ANNOUNCE_LIST_LOAD_FAILED = 'ANNOUNCE_LIST_LOAD_FAILED'
export const ANNOUNCE_LIST_LOADING = 'ANNOUNCE_LIST_LOADING'
export const ANNOUNCE_MATCHING_ITEMS_LOADED = 'ANNOUNCE_MATCHING_ITEMS_LOADED'
export const ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED = 'ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED'
export const ANNOUNCE_MATCHING_ITEMS_LOADING = 'ANNOUNCE_MATCHING_ITEMS_LOADING'
export const INVALIDATE_LIST = 'INVALIDATE_LIST'
export const UPDATE_LIST_PAGINATION = 'UPDATE_LIST_PAGINATION'
export const UPDATE_LIST_FILTER = 'UPDATE_LIST_FILTER'
export const UPDATE_LIST_SELECTION = 'UPDATE_LIST_SELECTION'
export const UPDATE_LIST_DISPLAY_MODE = 'UPDATE_LIST_DISPLAY_MODE'

export function update_list_pagination(list_key, pagination) {
    return {
        type: UPDATE_LIST_PAGINATION,
        list_key: list_key,
        pagination: pagination
    }
}

export function update_list_filter(list_key, filter) {
    return {
        type: UPDATE_LIST_FILTER,
        list_key: list_key,
        filter: filter
    }
}

export function collapse_list(list_key) {
    return {
	type: UPDATE_LIST_DISPLAY_MODE,
	list_key: list_key,
	display_mode: 'collapsed'
    }
}

export function expand_list(list_key) {
    return {
	type: UPDATE_LIST_DISPLAY_MODE,
	list_key: list_key,
	display_mode: 'expanded'
    }
}

export function unselectAllItems(list_key) {
    return {
	type: UPDATE_LIST_SELECTION,
	list_key: list_key,
	selected_ids: []
    }
}

export function selectItems(list_key, selected_ids) {

    return {
	type: UPDATE_LIST_SELECTION,
	list_key: list_key,
	selected_ids: selected_ids
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

function announceListLoaded(list_key, payload) {

    return {
        type: ANNOUNCE_LIST_LOADED,
        visible_item_ids: payload.ids,
	pagination: payload.pagination,
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

function announceListLoadFailed(list_key,error) {
    return {
        type: ANNOUNCE_LIST_LOAD_FAILED,
	list_key: list_key,
        error: error,
        received_at: Date.now()
    }
}

function announceMatchingItemsLoadFailed(list_key, error) {
    return {
        type: ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED,
	list_key: list_key,
        error: error,
        received_at: Date.now()
    }
}

function tryFetchMatchingItems(dispatch, state, list_key,
			       required_item_ids,
			       matching_items_key, matching_items_promise_func) {
    // The second half of tryFetchListAndItems, separated out for clarity
    
    const required_item_refs = required_item_ids.map((item_id, index) => "" + item_id)
    const matching_items = state[matching_items_key] || {}
    const matching_item_ids = keys(matching_items.items_by_id || {}) // magic, assumes the matching_items reducer will use 'items_by_id' as well
    const matching_item_refs = matching_item_ids.map((item_id, index) => "" + item_id)
    
    let unmatching_item_ids = difference(required_item_refs, matching_item_refs)
    unmatching_item_ids = union(unmatching_item_ids, matching_items.invalidated_item_ids || [])

    if ( unmatching_item_ids.length > 0 ) {
	dispatch(announceMatchingItemsLoading(list_key))
	matching_items_promise_func(dispatch, unmatching_item_ids)
	    .then(() => {
		dispatch(announceMatchingItemsLoaded(list_key))
	    })
	    .catch(function (error) {
		dispatch(announceMatchingItemsLoadFailed(list_key, "Failed to load list: " + error))
		throw(error)
	    })
    }
}

function tryFetchListAndItems(state, list_key,
			      matching_items_key, matching_items_promise_func) {

    // First tries to fetch the list of items, and then fetches all
    // missing matching items
    
    return dispatch => {

	const item_list = state.item_list || {}
	const l = item_list[list_key] || {}

	if ( ! shouldFetchList(state, list_key) ) {
	    const visible_item_ids = l.visible_item_ids
	    return tryFetchMatchingItems(dispatch, state, list_key,
					 visible_item_ids,
					 matching_items_key, matching_items_promise_func)
	}
	
	dispatch(announceListLoading(list_key))
	const params = { filter: l.filter || {},
			 format: {ids_only: true},
			 pagination: l.pagination || {} }
        return impfetch('/imp/' + matching_items_key + "/", {params:params})
            .then(response => response.json())
            .then(json => {

		if (json.status != 'success') {
                    dispatch(announceListLoadFailed(list_key, json.error))
                } else {
		    dispatch(announceListLoaded(list_key, json.payload))
		    const required_item_ids = json.payload.ids || []
		    tryFetchMatchingItems(dispatch, state, list_key,
					  required_item_ids,
					  matching_items_key,
					  matching_items_promise_func)
		}
            })
	    .catch(function (error) {
                dispatch(announceListLoadFailed(list_key,"Failed to load list: " + error))
		throw(error)
            })
    }
}

function shouldFetchList(state, list_key) {

    const item_list = state.item_list || {}
    const l = item_list[list_key] || {}
    if ( l.items_invalidated ) {
	return true
    }
    if( l.is_loading ) {
	return false
    }
    if ( ! l.visible_item_ids ) {
	return true
    }
}

export function fetchListIfNeeded(list_key,
				  matching_items_key, matching_items_promise_func) {
    return (dispatch, getState) => {
        const state = getState()

	dispatch(tryFetchListAndItems(state, list_key,
				      matching_items_key,
				      matching_items_promise_func))
    }
}
