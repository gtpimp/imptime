import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import map from 'lodash/map'

export const ANNOUNCE_LIST_LOADED = 'ANNOUNCE_LIST_LOADED'
export const ANNOUNCE_LIST_LOAD_FAILED = 'ANNOUNCE_LIST_LOAD_FAILED'
export const ANNOUNCE_LIST_LOADING = 'ANNOUNCE_LIST_LOADING'
export const INVALIDATE_LIST = 'INVALIDATE_LIST'
export const UPDATE_LIST_PAGINATION = 'UPDATE_LIST_PAGINATION'
export const UPDATE_LIST_FILTER = 'UPDATE_LIST_FILTER'

export function update_list_pagination(context_key, new_pagination) {
    return {
        type: UPDATE_LIST_PAGINATION,
        context_key: context_key,
        new_pagination: new_pagination
    }
}

export function update_list_filter(context_key, new_filter) {
    return {
        type: UPDATE_LIST_FILTER,
        context_key: context_key,
        new_filter: new_filter
    }
}

export function invalidateList() {
    return {
        type: INVALIDATE_LIST
    }
}

function announceListLoading() {
    return {
        type: ANNOUNCE_LIST_LOADING
    }
}

function announceListLoaded(context_key, items) {

    return {
        type: ANNOUNCE_LIST_LOADED,
        items_by_id: map(items, 'id')
	context_key: context_key,
        received_at: Date.now()
    }
}

function announceListLoadFailed(error_message) {
    return {
        type: ANNOUNCE_LIST_LOAD_FAILED,
        error_message: error_message,
        received_at: Date.now()
    }
}

function fetchList(item_ids) {
    return dispatch => {
        dispatch(announceListLoading())
        return impfetch('/imp/project', {params:{item_ids:item_ids}})
            .then(response => response.json())
            .then(json => {
                if (json.status != 'success') {
                    dispatch(announceListLoadFailed(json.error_message))
                } else {
                    dispatch(announceListLoaded(json.payload))
                }
            }).catch(function (error) {
                dispatch(announceListLoadFailed("Failed to load list: " + error.message))
            })
    }
}

function shouldFetchList(state, project_ids, context_key) {
    
    const { list_by_id, item_list } = state
    const l = (item_list && item_list[context_key]) || {}

    if ( l.invalidate_items ) {
	return true
    }
    if ( l.loading ) {
	return false
    }
    if ( ! l.visible_item_ids ) {
	return true
    }
}

function shouldFetchMatchingItems(items_by_id, context_key) {

    TO BE CONTINUE
    
    const visible_item_ids = l.visible_item_ids || []
    const missing_item_ids = difference(visible_item_ids, keys(list_by_id))
    /* const list = visible_project_ids.map(
       function(visible_id, index) {
       const project = list_by_id[visible_id]
       if ( ! project ) {
       project = { 'status': 'loading' }
       }
       return project
     * })*/
    
    if ( missing_project_ids.length > 0 ) {
	if (!list) {
            return true
	} else {
            return list.items_invalidated
	}
    }

    export function fetchListIfNeeded(list_id) {
	return (dispatch, getState) => {
            const state = getState()
            if (shouldFetchList(state, list_id)) {
		return dispatch(fetchList(list_id))
            }
	}
    }
