import { impfetch } from './lib.js'

import { fetchListIfNeeded, getMissingItemIds, updateVisibleItemIdAbove } from './ItemList'
import { map, difference, keyBy, compact } from 'lodash'

export const ANNOUNCE_ITEMS_SAVING = 'ANNOUNCE_ITEMS_SAVING'
export const ANNOUNCE_ITEMS_SAVED = 'ANNOUNCE_ITEMS_SAVED'
export const ANNOUNCE_ITEM_SAVE_FAILED = 'ANNOUNCE_ITEM_SAVE_FAILED'

export const ANNOUNCE_ITEMS_LOADED = 'ANNOUNCE_ITEMS_LOADED'
export const ANNOUNCE_ITEMS_LOAD_FAILED = 'ANNOUNCE_ITEMS_LOAD_FAILED'
export const ANNOUNCE_LOADING_ITEMS = 'ANNOUNCE_LOADING_ITEMS'
export const INVALIDATE_ITEMS = 'INVALIDATE_ITEMS'
export const INVALIDATE_ALL_ITEMS = 'INVALIDATE_ALL_ITEMS'

export const ANNOUNCE_CAPTURING_NEW_ITEM = 'ANNOUNCE_CAPTURING_NEW_ITEM'
export const UPDATE_NEW_ITEM_DETAILS = 'UPDATE_NEW_ITEM_DETAILS'
export const CANCEL_CREATING_NEW_ITEM = 'CANCEL_CREATING_NEW_ITEM'
export const ANNOUNCE_SAVING_NEW_ITEM = 'ANNOUNCE_SAVING_NEW_ITEM'
export const ANNOUNCE_SAVED_NEW_ITEM = 'ANNOUNCE_SAVED_NEW_ITEM'
export const ANNOUNCE_SAVING_NEW_ITEM_FAILED = 'ANNOUNCE_SAVING_NEW_ITEM_FAILED'

export const ANNOUNCE_DELETING_ITEM = 'ANNOUNCE_DELETING_ITEM'
export const ANNOUNCE_ITEM_DELETED = 'ANNOUNCE_ITEM_DELETED'
export const ANNOUNCE_DELETE_ITEM_FAILED = 'ANNOUNCE_DELETE_ITEM_FAILED'

export function invalidateAllItems(entity_key) {
    return {
        type: INVALIDATE_ALL_ITEMS,
        entity_key: entity_key
    }
}

export function invalidateItems(entity_key, item_ids) {
    return {
        type: INVALIDATE_ITEMS,
        entity_key: entity_key,
	item_ids_to_invalidate: item_ids
    }
}

function announceLoadingItems(entity_key, item_ids) {
    return {
        type: ANNOUNCE_LOADING_ITEMS,
        entity_key: entity_key, 
	item_ids_to_load: item_ids
    }
}

function announceItemsLoaded(entity_key, item_payload) {

    return {
        type: ANNOUNCE_ITEMS_LOADED,
        entity_key: entity_key, 
        items_by_id: keyBy(item_payload, 'id'),
	received_at: Date.now()
    }
}

function announceItemsLoadFailed(entity_key, error) {
    return {
        type: ANNOUNCE_ITEMS_LOAD_FAILED,
        entity_key: entity_key, 
        error: error,
        received_at: Date.now()
    }
}

function fetchItemsPromise(dispatch, state, entity_key, item_ids) {
    return new Promise(function(resolve, reject) {
	dispatch(announceLoadingItems(entity_key, item_ids))
	const params = { filter: { ids: item_ids },
			 pagination: {'enabled': false} }

        return impfetch(state, 'imp/'+entity_key+'/', dispatch, {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceItemsLoadFailed(entity_key))
		    reject(json.error)
                } else {
		    dispatch(announceItemsLoaded(entity_key, json.payload))
		    resolve(json.payload)
                }
	    }).catch(function (error) {
		dispatch(announceItemsLoadFailed(entity_key, "Failed to load items: " + entity_key + " : " + error))
		reject("Failed to load items: " + error)
	    })
    })
}

function announceItemSaveFailed(entity_key, error) {
    return {
        type: ANNOUNCE_ITEM_SAVE_FAILED,
        entity_key: entity_key, 
        error: error,
        received_at: Date.now()
    }
}

function announceItemsSaved(entity_key, item_ids) {
    return {
        type: ANNOUNCE_ITEMS_SAVED,
        entity_key: entity_key, 
        item_ids: item_ids,
        saved_at: Date.now()
    }
}

function announceItemsSaving(entity_key, item_ids, field_name, new_value) {
    return {
        type: ANNOUNCE_ITEMS_SAVING,
        entity_key: entity_key, 
        item_ids: item_ids,
	field_name: field_name,
	new_value: new_value
    }
}

function announceCandidateItemSaving(entity_key) {
    return {
        type: ANNOUNCE_SAVING_NEW_ITEM,
        entity_key: entity_key
    }
}

function announceCandidateItemSaved(entity_key, new_item) {
    return {
        type: ANNOUNCE_SAVED_NEW_ITEM,
        entity_key: entity_key,         
	item: new_item
    }
}

function announceCandidateItemSaveFailed(entity_key, error) {
    return {
	type: ANNOUNCE_SAVING_NEW_ITEM_FAILED,
        entity_key: entity_key, 
	error: error
    }
}

function announceDeletingItem(entity_key, item_id) {
    return {
        type: ANNOUNCE_DELETING_ITEM,
        entity_key: entity_key, 
	deleting_item_id: item_id
    }
}

export function announceItemDeleted(entity_key, item_id) {
    return {
	type: ANNOUNCE_ITEM_DELETED,
        entity_key: entity_key, 
	deleted_item_id: item_id
    }
}

function announceItemDeleteFailed(entity_key, item_id, error) {
    return {
        type: ANNOUNCE_DELETE_ITEM_FAILED,
        entity_key: entity_key, 
	deleting_item_id: item_id,
	error: error
    }
}

function updateItem(entity_key, item_ids, field_name, new_value, on_done) {
    return (dispatch, getState) => {
        const state = getState()
	dispatch(announceItemsSaving(entity_key, item_ids, field_name, new_value))
	let data = {item_ids: item_ids,
                    field_name: field_name,
		    value: new_value }
	return impfetch(state, "imp/"+entity_key +"/"+item_ids[0]+"/", dispatch,
			{method: "PUT",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"},
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceItemSaveFailed(entity_key, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
                 dispatch(announceItemsSaved(entity_key, item_ids))
             }
	     if ( on_done ) {
		 on_done()
	     }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceItemSaveFailed(entity_key, error))
	 })
    }
}

export function startCandidateItem(entity_key, sprint_id, item_id_before) {
    return (dispatch, getState) => {
	const state = getState()
	dispatch({
	    type: ANNOUNCE_CAPTURING_NEW_ITEM,
            entity_key: entity_key,
            candidate_item: { item_id_before: item_id_before,
	                      sprint_id: sprint_id }
	})
    }
}

export function cancelCandidateItem(entity_key) {
    return {
	type: CANCEL_CREATING_NEW_ITEM,
        entity_key: entity_key
    }
}

export function saveCandidateItem(entity_key) {

    return (dispatch, getState) => {
	      const state = getState()
	      dispatch(announceCandidateItemSaving(entity_key, ))
	      let data = {item: state.item.candidate_item}

	      return impfetch(state, "imp/"+entity_key+"/", dispatch,
			                  {method: "POST",
			                   credentials: 'same-origin',
			                   data: data,
			                   headers: {"Content-type": "application/json; charset=UTF-8"},
			                   body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceCandidateItemSaveFailed(entity_key, json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
		             dispatch(announceCandidateItemSaved(entity_key, json.payload.item))
             }
	       })
	       .catch(function (error) {
             console.log('Request failed', error);
	           dispatch(announceCandidateItemSaveFailed(entity_key, error))
	       })
    }
}

export function deleteItem(entity_key, item_id) {
    return (dispatch, getState) => {
	      const state = getState()
	      dispatch(announceDeletingItem(entity_key, item_id))
	      let data = { item_id: item_id }
	      return impfetch( state, "imp/item/", dispatch,
			                   {method: "DELETE",
			                    credentials: 'same-origin',
			                    data: data,
			                    headers: {"Content-type": "application/json; charset=UTF-8"},
			                    body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceItemDeleteFailed(entity_key, item_id, json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
		             dispatch(announceItemDeleted(entity_key, item_id))
             }
	       })
	       .catch(function (error) {
             console.log('Request failed', error);
	           dispatch(announceItemDeleteFailed(entity_key, item_id, error))
	       })
    }
}

export function getCandidateItem(entity_key, state) {
    const item_objs = (state || {})[entity_key] || {}
    return item_objs.candidate_item
}

export function is_item_invalidated(state, entity_key, item_id) {
    return ((((state || {})[entity_key] || {}).invalidated_item_ids) || []).indexOf(item_id) !== -1
}

export function getItem(state, entity_key, item_id) {
    // Only gets the item if it's already loaded, use
    // ensureItemsLoaded to trigger a fetch from the server
    return ((state[entity_key] || {}).items_by_id || {})[item_id] || null
}

export function getItems(state, entity_key, item_ids) {
    const item_objs = state[entity_key]
    const items_by_id = (item_objs && item_objs.items_by_id) || {}
    return items_by_id && item_ids && compact(item_ids.map(function (item_id, index) {
        return items_by_id[item_id] || {
            'id': item_id,
            'loaded': false
        }
    }))
}

export function fetchItemsIfNeeded(entity_key, list_key) {
    const matching_items_key = entity_key
    const matching_items_promise_func =
        function(dispatch, state, unmatching_item_ids) {
            return fetchItemsPromise(dispatch, state, entity_key, unmatching_item_ids)
        }
    const is_generic_item = true
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func, is_generic_item)
}

export function ensureItemsLoaded(entity_key, item_ids) {
    return (dispatch, getState) => {
        const state = getState()
        const item_ids_to_load = getMissingItemIds((state || {}).item || {}, item_ids, entity_key)
        if ( item_ids_to_load.length > 0 ) {
            fetchItemsPromise(dispatch, state, entity_key, item_ids_to_load)
        }
    }
}
