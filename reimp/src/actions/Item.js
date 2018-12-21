import { impfetch } from './lib.js'

import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { get, values, map, difference, intersection, keyBy, compact } from 'lodash'

import { setSoftErrorMessage } from './Error'

export const ANNOUNCE_ITEMS_SAVING = 'ANNOUNCE_ITEMS_SAVING'
export const ANNOUNCE_ITEMS_SAVED = 'ANNOUNCE_ITEMS_SAVED'
export const ANNOUNCE_ITEM_SAVE_FAILED = 'ANNOUNCE_ITEM_SAVE_FAILED'
export const ANNOUNCE_ITEM_SOFT_FAILURE = 'ANNOUNCE_ITEM_SOFT_FAILURE'

export const ANNOUNCE_ITEMS_LOADED = 'ANNOUNCE_ITEMS_LOADED'
export const ANNOUNCE_ITEMS_LOAD_FAILED = 'ANNOUNCE_ITEMS_LOAD_FAILED'
export const ANNOUNCE_LOADING_ITEMS = 'ANNOUNCE_LOADING_ITEMS'
export const INVALIDATE_ITEMS = 'INVALIDATE_ITEMS'
export const INVALIDATE_ALL_ITEMS = 'INVALIDATE_ALL_ITEMS'
export const SET_TRANSIENT_ITEM_VALUE = 'SET_TRANSIENT_ITEM_VALUE'

export const ANNOUNCE_CAPTURING_NEW_ITEM = 'ANNOUNCE_CAPTURING_NEW_ITEM'
export const UPDATE_NEW_ITEM_DETAILS = 'UPDATE_NEW_ITEM_DETAILS'
export const CANCEL_CREATING_NEW_ITEM = 'CANCEL_CREATING_NEW_ITEM'
export const ANNOUNCE_SAVING_NEW_ITEM = 'ANNOUNCE_SAVING_NEW_ITEM'
export const ANNOUNCE_SAVED_NEW_ITEM = 'ANNOUNCE_SAVED_NEW_ITEM'
export const ANNOUNCE_SAVING_NEW_ITEM_FAILED = 'ANNOUNCE_SAVING_NEW_ITEM_FAILED'

export const ANNOUNCE_DELETING_ITEM = 'ANNOUNCE_DELETING_ITEM'
export const ANNOUNCE_ITEM_DELETED = 'ANNOUNCE_ITEM_DELETED'
export const ANNOUNCE_DELETE_ITEM_FAILED = 'ANNOUNCE_DELETE_ITEM_FAILED'
export const ANNOUNCE_DELETING_ITEMS = 'ANNOUNCE_DELETING_ITEMS'
export const ANNOUNCE_ITEMS_DELETED = 'ANNOUNCE_ITEMS_DELETED'
export const ANNOUNCE_DELETE_ITEMS_FAILED = 'ANNOUNCE_DELETE_ITEMS_FAILED'
export const SET_GLOBAL_ENTITY_FLAG = 'SET_GLOBAL_ENTITY_FLAG'

export const UPDATE_ENTIRE_ITEM_FIELD_NAME = "__all__"
export const PERFORM_CUSTOM_MANIPULATION = "PERFORM_CUSTOM_MANIPULATION"

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

export function setGlobalEntityFlag(entity_key, field_name, new_value) {
    return {
        type: SET_GLOBAL_ENTITY_FLAG,
        entity_key: entity_key,
        field_name: field_name,
        new_value: new_value
    }
}

export function getGlobalEntityFlag(entity_key, state, field_name) {
    return get(state, ["item", entity_key, field_name])
}

function announceLoadingItems(entity_key, item_ids) {
    return {
        type: ANNOUNCE_LOADING_ITEMS,
        entity_key: entity_key,
        item_ids_to_load: item_ids
    }
}

function announceItemsLoaded(entity_key, payload) {

    let item_payload = payload[entity_key + "s"]
    if ( ! item_payload ) {
        item_payload = payload.items
    }
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

function fetchItemsPromise(dispatch, state, entity_key, item_ids, additional_get_args) {
    return new Promise(function(resolve, reject) {
        dispatch(announceLoadingItems(entity_key, item_ids))
        const params = { filter: { ids: item_ids },
                         pagination: {'enabled': false},
                         additional_params: additional_get_args || null }

        let url = 'imp/'+entity_key
        if ( additional_get_args && additional_get_args.url_suffix ) {
            url += additional_get_args.url_suffix
        }
        url += "/"
        
        return impfetch(state, url, dispatch, {params:params})
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

export function announceItemSaveFailed(entity_key, error, failure_type) {
    return {
        type: ANNOUNCE_ITEM_SAVE_FAILED,
        entity_key: entity_key,
        failure_type: failure_type || "error",
        error: error,
        received_at: Date.now()
    }
}

export function announceSoftFailure(entity_key, error) {
    return (dispatch, getState) => {
        dispatch(announceItemSaveFailed(entity_key, error, "soft"))
        dispatch(setSoftErrorMessage(error))
    }
}

export function announceItemsSaved(entity_key, item_ids, items) {
    return {
        type: ANNOUNCE_ITEMS_SAVED,
        entity_key: entity_key,
        item_ids: item_ids,
        saved_at: Date.now(),
        items_by_id: keyBy(items || {}, 'id'),
    }
}

export function announceItemsSaving(entity_key, item_ids, field_name, new_value) {
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

function announceDeletingItems(entity_key, item_ids) {
    return {
        type: ANNOUNCE_DELETING_ITEMS,
        entity_key: entity_key,
        deleting_item_ids: item_ids
    }
}

export function announceItemsDeleted(entity_key, item_ids) {
    return {
        type: ANNOUNCE_ITEMS_DELETED,
        entity_key: entity_key,
        deleted_item_ids: item_ids
    }
}

function announceItemsDeleteFailed(entity_key, item_ids, error) {
    return {
        type: ANNOUNCE_DELETE_ITEMS_FAILED,
        entity_key: entity_key,
        deleting_item_ids: item_ids,
        error: error
    }
}

export function setTransientItemValue(entity_key, item_ids, field_name, new_value) {
    return {
        type: SET_TRANSIENT_ITEM_VALUE,
        entity_key: entity_key,
        item_ids: item_ids,
        field_name: field_name,
        new_value: new_value
    }
}

export function getTransientItemValue(state, entity_key, item_id, field_name) {
    return get(state, ["item", entity_key, "transient_values_by_id", field_name], null)
}

export function updateItem(entity_key, item_ids, field_name, new_value, on_done, extra_post_data) {
    return (dispatch, getState) => {
        const state = getState()
        dispatch(announceItemsSaving(entity_key, item_ids, field_name, new_value))
        let data = Object.assign({},{item_ids: item_ids,
                                     field_name: field_name,
                                     value: new_value},
                                 extra_post_data || {})
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
                 dispatch(announceItemsSaved(entity_key, item_ids, json.payload.items))
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

export function startCandidateItem(entity_key, candidate_item) {
    return (dispatch, getState) => {
        dispatch({
            type: ANNOUNCE_CAPTURING_NEW_ITEM,
            entity_key: entity_key,
            candidate_item: candidate_item
        })
    }
}

export function updateCandidateDetails(entity_key, new_data) {
    return {
        type: UPDATE_NEW_ITEM_DETAILS,
        entity_key: entity_key,
        candidate_item: new_data
    }
}

export function cancelCandidateItem(entity_key) {
    return {
        type: CANCEL_CREATING_NEW_ITEM,
        entity_key: entity_key
    }
}

export function saveCandidateItem(entity_key, on_done) {

    return (dispatch, getState) => {
        const state = getState()
        dispatch(announceCandidateItemSaving(entity_key))
        let data = {item: getCandidateItem(entity_key, state)}

        return impfetch(state, "imp/"+entity_key+"/", dispatch,
                        {method: "POST",
                         credentials: 'same-origin',
                         data: data,
                         headers: {"Content-type": "application/json; charset=UTF-8"},
                         body: JSON.stringify(data)}
        ).then(response => response.json())
         .then(json => {
             if ( json.status === 'soft_failure' ) {
                 console.log("Soft failure: " + json.error)
                 dispatch(announceSoftFailure(entity_key, json.error))
             } else if ( json.status !== 'success' ) {
                 console.log('Request failed with JSON response', json);
                 dispatch(announceCandidateItemSaveFailed(entity_key, json.error))
             } else {
                 console.log('Request succeeded with JSON response', json);
                 dispatch(announceCandidateItemSaved(entity_key, json.payload.item))
                 if ( on_done ) {
                     on_done(json.payload.item.id)
                 }
             }
         })
         .catch(function (error) {
             console.log('Request failed', error);
             dispatch(announceCandidateItemSaveFailed(entity_key, error))
         })
    }
}

export function deleteItems(entity_key, item_ids) {
    return (dispatch, getState) => {
        const state = getState()
        dispatch(announceDeletingItems(entity_key, item_ids))
        let data = { item_ids: item_ids }
        return impfetch( state, "imp/" + entity_key + "/" + item_ids[0] + "/", dispatch,
                         {method: "DELETE",
                          credentials: 'same-origin',
                          data: data,
                          headers: {"Content-type": "application/json; charset=UTF-8"},
                          body: JSON.stringify(data)}
        ).then(response => response.json())
         .then(json => {
             if ( json.status !== 'success' ) {
                 console.log('Request failed with JSON response', json);
                 dispatch(announceItemsDeleteFailed(entity_key, item_ids, json.error))
             } else {
                 console.log('Request succeeded with JSON response`', json);
                 dispatch(announceItemsDeleted(entity_key, item_ids))
             }
         })
         .catch(function (error) {
             console.log('Request failed', error);
             dispatch(announceItemsDeleteFailed(entity_key, item_ids, error))
         })
    }
}

export function itemPost(entity_key, item_ids, url,
                         field_name, field_value, method, data, on_done) {
    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceItemsSaving(entity_key, item_ids, field_name, field_value))
	return impfetch( state, url, dispatch,
			 {method: method,
			  credentials: 'same-origin',
			  data: data,
			  headers: {"Content-type": "application/json; charset=UTF-8"},
			  body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status === 'soft_failure' ) {
                 console.log("Soft failure: " + json.error)
                 dispatch(announceSoftFailure(entity_key, json.error))
             } else if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceItemSaveFailed(entity_key, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceItemsSaved(entity_key, item_ids, get(json, ["payload", "items"], [])))
                 if ( on_done ) {
		     on_done(json)
	         }
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceItemSaveFailed(entity_key, error))
	 })
    }
}

export function getCandidateItem(entity_key, state) {
    const item_objs = (state.item || {})[entity_key] || {}
    return item_objs.candidate_item
}

export function is_item_invalidated(entity_key, state, item_id) {
    return ((((state.item || {})[entity_key] || {}).invalidated_item_ids) || []).indexOf(item_id) !== -1
}

export function getInvalidatedItemIds(entity_key, state, item_ids) {
    const all_invalidated_item_ids = ((((state.item || {})[entity_key] || {}).invalidated_item_ids) || [])
    return intersection(item_ids, all_invalidated_item_ids)
}

export function getSavingItemIds(entity_key, state, item_ids) {
    const all_saving_item_ids = (((state.item || {})[entity_key] || {}).saving_item_ids) || []
    return intersection(item_ids, all_saving_item_ids)
}

export function getItem(state, entity_key, item_id) {
    // Only gets the item if it's already loaded, use
    // ensureItemsLoaded to trigger a fetch from the server
    return (((state.item || {})[entity_key] || {}).items_by_id || {})[item_id] || null
}

export function getItemByRef(state, entity_key, ref) {
    // Only gets the item if it's already loaded, use
    // ensureItemsLoaded to trigger a fetch from the server
    const items_by_id = get(state, ["item", entity_key, "items_by_id"], null)
    const items_by_ref = keyBy(values(items_by_id), "share_ref")
    return items_by_ref[ref]
}

export function getAllItems(state, entity_key) {
    return ((state.item || {})[entity_key] || {}).items_by_id
}

export function getItems(state, entity_key, item_ids, real_only) {
    const item_objs = (state.item || {})[entity_key]
    const items_by_id = (item_objs && item_objs.items_by_id) || {}

    if ( real_only === true ) {
        return items_by_id && item_ids && compact(map(item_ids, (item_id) => items_by_id[item_id]))
    } else {
        return items_by_id && item_ids && compact(map(item_ids, (function (item_id, index) {
            return items_by_id[item_id] || {
                'id': item_id,
                'loaded': false
            }
        })))
    }
}

export function getItemsById(state, entity_key, item_ids) {
    const item_objs = (state.item || {})[entity_key]
    const items_by_id = (item_objs && item_objs.items_by_id) || {}
    const items = items_by_id && item_ids && compact(map(item_ids, function(item_id, index) {
        return items_by_id[item_id] || {
            'id': item_id,
            'loaded': false
        }
    }))
    return keyBy(items, 'id')
}

export function fetchItemsIfNeeded(entity_key, list_key) {
    const matching_items_key = entity_key
    const matching_items_promise_func =
        function(dispatch, state, unmatching_item_ids) {
            return fetchItemsPromise(dispatch, state, entity_key, unmatching_item_ids)
        }
    return fetchListIfNeeded(list_key, matching_items_key,
                             matching_items_promise_func,
                             { is_generic_item: true })
}

export function ensureItemsLoaded(entity_key, item_ids, additional_get_args) {
    return (dispatch, getState) => {
        const state = getState()
        const item_ids_to_load = getMissingItemIds((state || {}).item || {}, item_ids, entity_key)
        if ( item_ids_to_load.length > 0 ) {
            return fetchItemsPromise(dispatch, state, entity_key, item_ids_to_load, additional_get_args)
        }
    }
}

export function areAnyItemsInvalidated(state, entity_key, item_ids) {
    if ( ! item_ids ) {
        return false
    }
    const invalidated_ids = (((state || {}).item || {})[entity_key] || {}).invalidated_item_ids
    return difference(invalidated_ids, item_ids).length > 0
}

export function getLoadingItemIds(state, entity_key, item_ids) {
    /* if ( ! item_ids ) {
     *     return []
     * }
     * const real_only = true
     * const items = getItems(state, entity_key, item_ids, real_only)

     * */
    return intersection(item_ids, get(state, ["item", entity_key, "loading_item_ids"], []))
}

export function isLoadingItems(state, entity_key, item_ids) {
    return getLoadingItemIds(state, entity_key, item_ids).length > 0
}

export function customUpdate(entity_key, updateFunc, params) {
    // Typically create updateFunc in a custom reducers file
    return {
        type: PERFORM_CUSTOM_MANIPULATION,
        func: updateFunc,
        entity_key: entity_key,
        params: params
    }
}
