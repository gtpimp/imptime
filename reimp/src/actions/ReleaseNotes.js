import { impfetch } from './lib.js'
import { compact, map, keys, keyBy, includes, difference, indexOf, identity } from 'lodash'
import move from 'lodash-move'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { setIssueStoreValue } from './Issues'
import { ENTITY_KEY__RELEASE_NOTE } from '../actions/ItemListKeyRegistry'

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

export function invalidateAllReleaseNotes() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__RELEASE_NOTE))
    }
}

export function invalidateReleaseNotes(release_note_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__RELEASE_NOTE,
                                 release_note_ids_to_invalidate
        ))
    }
}

export function updateReleaseNote(release_note_ids, field_name, new_value, on_done) {
    return updateItem(ENTITY_KEY__RELEASE_NOTE, release_note_ids, field_name, new_value, on_done)
}

export function fetchReleaseNotesIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__RELEASE_NOTE, list_key))
    }
}

export function ensureReleaseNotesLoaded(release_note_ids) {
    return ensureItemsLoaded(ENTITY_KEY__RELEASE_NOTE, release_note_ids)
}

export function getReleaseNote(state, release_note_id) {
    return getItem(state, ENTITY_KEY__RELEASE_NOTE, release_note_id)
}

export function getReleaseNotes(state, release_note_ids) {
    return getItems(state, ENTITY_KEY__RELEASE_NOTE, release_note_ids)
}

export function createReleaseNote(header, content) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__RELEASE_NOTE, { header: header,
                                                                content: content }))
        dispatch(saveCandidateItem(ENTITY_KEY__RELEASE_NOTE))
    }
}

export function deleteReleaseNote(release_note_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__RELEASE_NOTE, [release_note_id]))
    }
}

export function markReleaseNotesAsSeen(release_note_ids) {
    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceItemsSaving(ENTITY_KEY__RELEASE_NOTE, release_note_ids[0]))
	let data = { release_note_ids: release_note_ids }
	return impfetch( state, "imp/" + ENTITY_KEY__RELEASE_NOTE + "/mark_seen/", dispatch,
			 {method: "POST",
			  credentials: 'same-origin',
			  data: data,
			  headers: {"Content-type": "application/json; charset=UTF-8"},
			  body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
                 dispatch(announceItemSaveFailed(ENTITY_KEY__RELEASE_NOTE, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceItemsSaved(ENTITY_KEY__RELEASE_NOTE, release_note_ids))
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
             dispatch(announceItemSaveFailed(ENTITY_KEY__RELEASE_NOTE, error))
	 })
    }
}
