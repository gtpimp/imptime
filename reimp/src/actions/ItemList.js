import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import map from 'lodash/map'
import compact from 'lodash/compact'

export const INIT_LIST = 'INIT_LIST'
export const ANNOUNCE_LIST_LOADED = 'ANNOUNCE_LIST_LOADED'
export const ANNOUNCE_LIST_LOAD_FAILED = 'ANNOUNCE_LIST_LOAD_FAILED'
export const ANNOUNCE_LIST_LOADING = 'ANNOUNCE_LIST_LOADING'
export const ANNOUNCE_MATCHING_ITEMS_LOADED = 'ANNOUNCE_MATCHING_ITEMS_LOADED'
export const ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED = 'ANNOUNCE_MATCHING_ITEMS_LOAD_FAILED'
export const ANNOUNCE_MATCHING_ITEMS_LOADING = 'ANNOUNCE_MATCHING_ITEMS_LOADING'
export const SET_ITEMS_FLAG = 'SET_ITEMS_FLAG'
export const INVALIDATE_LIST = 'INVALIDATE_LIST'
export const UPDATE_LIST_PAGINATION = 'UPDATE_LIST_PAGINATION'
export const UPDATE_LIST_FILTER = 'UPDATE_LIST_FILTER'
export const UPDATE_LIST_SELECTION = 'UPDATE_LIST_SELECTION'
export const UPDATE_LIST_DISPLAY_MODE = 'UPDATE_LIST_DISPLAY_MODE'



export function initList(list_key) {
    return {
	      type: INIT_LIST,
	      list_key: list_key
    }
}

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

export function getDisplayMode(state, list_key) {
    return ((state.item_list || {})[list_key] || {}).display_mode
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

export function setItemFlag(list_key, selected_ids, flag_name, flag_value) {
    return {
        type: SET_ITEMS_FLAG,
        list_key: list_key,
        selected_ids: selected_ids,
        flag_name: flag_name,
        flag_value: flag_value
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

function tryFetchMatchingItems(list_key,
			       required_item_ids,
			       matching_items_key, matching_items_promise_func) {
    // The second half of tryFetchListAndItems, separated out for clarity

    return (dispatch, getState) => {

	      if ( ! required_item_ids ) {
	          return
	      }

	      const state = getState()
	      const l = (state.item_list || {})[list_key] || {}
	      if ( l.loading_matching_items ) {
	          return
	      }

	      const unmatching_item_ids = getMissingItemIds(state, required_item_ids, matching_items_key)
	      if ( unmatching_item_ids.length > 0 ) {
	          dispatch(announceMatchingItemsLoading(list_key))
	          matching_items_promise_func(dispatch, state, unmatching_item_ids)
		            .then(() => {
		                dispatch(announceMatchingItemsLoaded(list_key))
		            })
		            .catch(function (error) {
		                dispatch(announceMatchingItemsLoadFailed(list_key, "Failed to load entity list: " + error))
		            })
        }
    }
}

function _stringify_id(id) {
    return "d" + id
}

function _unstringify_id(id) {
    return id.substr(1)
}

export function getMissingItemIds(state, required_item_ids, matching_items_key) {
    // Returns a list of item_ids which aren't already loaded or invalidated or already loading

    // const matching_item_refs = forEach(matching_item_ids, function(item_id, index) { return "" + item_id })

    // take required
    // remove those that are loading
    // get the existing list that isn't invalidated

    const required_item_refs = map(required_item_ids, _stringify_id)
    const items = state[matching_items_key] || {}

    let item_ids_to_load = required_item_refs

    // remove items being loaded
    const loading_item_ids = map(items.loading_item_ids || [], _stringify_id)
    item_ids_to_load = difference(item_ids_to_load, loading_item_ids)

    // get the list of all un-invalidated items
    const existing_item_ids = map(keys(items.items_by_id || {}), _stringify_id)
    const invalidated_item_ids = map(items.invalidated_item_ids || [], _stringify_id)
    const uninvalidated_item_ids = difference(existing_item_ids, invalidated_item_ids)

    // remove all un-invalidated items
    item_ids_to_load = difference(item_ids_to_load, uninvalidated_item_ids)

    // remove nulls and convert back to original ids
    item_ids_to_load = compact(item_ids_to_load)
    item_ids_to_load = map(item_ids_to_load, _unstringify_id)

    return item_ids_to_load
}

function tryFetchListAndItems(list_key, matching_items_key, matching_items_promise_func, fetch_item_ids_url) {

    // First tries to fetch the list of items, and then fetches all
    // missing matching items

    fetch_item_ids_url = fetch_item_ids_url || 'imp/' + matching_items_key + '/'
    
    return (dispatch, getState) => {
	      const state = getState()

	      const item_list = state.item_list || {}
	      const l = item_list[list_key] || {}

	      if ( ! shouldFetchList(state, list_key) ) {
	          const visible_item_ids = l.visible_item_ids
	          if ( visible_item_ids ) {
		            dispatch(tryFetchMatchingItems(list_key,
					                                     visible_item_ids,
					                                     matching_items_key, matching_items_promise_func))
	          }
	          return null
	      }

	      dispatch(announceListLoading(list_key))
	      const params = { filter: l.filter || {},
			                   format: {ids_only: true},
			                   pagination: l.pagination || {} }
        return impfetch(state, fetch_item_ids_url, dispatch, {params:params})
            .then(response => response.json())
            .then(json => {
		            if (json.status !== 'success') {
                    dispatch(announceListLoadFailed(list_key, json.error))
                } else {
		                dispatch(announceListLoaded(list_key, json.payload))
		                const required_item_ids = json.payload.ids || []
		                dispatch(tryFetchMatchingItems(list_key,
						                                       required_item_ids,
						                                       matching_items_key,
						                                       matching_items_promise_func))
		            }
            })
	          .catch(function (error) {
                dispatch(announceListLoadFailed(list_key,"Failed to load list: " + list_key + " : " + error))
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
				  matching_items_key,
                                  matching_items_promise_func,
                                  fetch_item_ids_url ) {
    return tryFetchListAndItems(list_key,
			        matching_items_key,
			        matching_items_promise_func,
                                fetch_item_ids_url)
}

export function getVisibleItemIds(state, list_key) {
    const item_list = ((state || {}).item_list || {})[list_key] || {}
    const visible_item_ids = item_list.visible_item_ids || []
    return visible_item_ids
}

export function getVisibleItems(state, list_key, entity_key) {
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const items_by_id = ((state || {})[entity_key] || {}).items_by_id || {}
    return (items_by_id && visible_item_ids.map( function(visible_item_id, index) {
	return items_by_id[visible_item_id] || { 'id': visible_item_id,
						 'loaded': false }
    })) || []    
}

export function getSelectedItemIds(state, list_key) {
    const item_list = ((state || {}).item_list || {})[list_key] || {}
    const selected_item_ids = item_list.selected_ids || []
    return selected_item_ids    
}

export function getSelectedItems(state, list_key, entity_key) {
    const selected_item_ids = getSelectedItemIds(state, list_key)
    const items_by_id = ((state || {})[entity_key] || {}).items_by_id || {}
    return (items_by_id && selected_item_ids.map( function(selected_item_id, index) {
	return items_by_id[selected_item_id] || { 'id': selected_item_id,
						  'loaded': false }
    })) || []        
}

export function isLoading(state, list_key) {
    return (state.item_list || {}).is_loading || false
}

export function getLastUpdated(state, list_key) {
    return (state.item_list || {}).last_updated || null
}

export function getLoadingItemIds(state, list_key) {
    return (state.item_list || {}).loading_item_ids || []
}
