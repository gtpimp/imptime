import { impfetch } from './lib.js'
import { compact, map, keys, keyBy, includes, difference, indexOf, identity } from 'lodash'
import move from 'lodash-move'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__NUDGE } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsPromise,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    updateItem,
    startCandidateItem,
    saveCandidateItem,
    deleteItems,
    announceItemSaveFailed,
    announceItemsSaved,
    announceItemsSaving
} from '../actions/Item'

export function invalidateAllNudges() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__NUDGE))
    }
}

export function invalidateNudges(nudge_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__NUDGE,
                                 nudge_ids_to_invalidate
        ))
    }
}

export function updateNudge(nudge_ids, field_name, new_value, on_done) {
    return updateItem(ENTITY_KEY__NUDGE, nudge_ids, field_name, new_value, on_done)
}

export function fetchNudgesIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__NUDGE, list_key))
    }
}

export function ensureNudgesLoaded(nudge_ids) {
    return ensureItemsLoaded(ENTITY_KEY__NUDGE, nudge_ids)
}

export function getNudge(state, nudge_id) {
    return getItem(state, ENTITY_KEY__NUDGE, nudge_id)
}

export function getNudges(state, nudge_ids) {
    return getItems(state, ENTITY_KEY__NUDGE, nudge_ids)
}

export function createNudge(header, content) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__NUDGE, { header: header,
                                                         content: content }))
        dispatch(saveCandidateItem(ENTITY_KEY__NUDGE))
    }
}

export function deleteNudge(nudge_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__NUDGE, [nudge_id]))
    }
}

export function recalculateNudges() {
    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceItemsSaving(ENTITY_KEY__NUDGE, []))
	let data = {}
	return impfetch( state, "imp/" + ENTITY_KEY__NUDGE + "/recalculate/", dispatch,
			 {method: "POST",
			  credentials: 'same-origin',
			  data: data,
			  headers: {"Content-type": "application/json; charset=UTF-8"},
			  body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
                 dispatch(announceItemSaveFailed(ENTITY_KEY__NUDGE, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceItemsSaved(ENTITY_KEY__NUDGE, []))
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
             dispatch(announceItemSaveFailed(ENTITY_KEY__NUDGE, error))
	 })
    }
}
