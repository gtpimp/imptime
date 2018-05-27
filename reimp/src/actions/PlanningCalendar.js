import { impfetch } from './lib.js'
import { filter, includes } from 'lodash'
import {
    ENTITY_KEY__PLANNING_CALENDAR,
} from './ItemListKeyRegistry'
import {
    invalidateAllItems,
    invalidateItems,
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
    announceItemsSaving,
    setGlobalEntityFlag,
    getGlobalEntityFlag
} from '../actions/Item'
import {
    updateMienHeaders,
    getHeaderListForCurrentMien,
    getHeaderListForMien
} from '../actions/Mien'

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
        dispatch(setGlobalEntityFlag(ENTITY_KEY__NUDGE, "recalculating", true))
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
                 dispatch(setGlobalEntityFlag(ENTITY_KEY__NUDGE, "recalculating", false))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceItemsSaved(ENTITY_KEY__NUDGE, []))
                 dispatch(setGlobalEntityFlag(ENTITY_KEY__NUDGE, "recalculating", false))
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
             dispatch(announceItemSaveFailed(ENTITY_KEY__NUDGE, error))
             dispatch(setGlobalEntityFlag(ENTITY_KEY__NUDGE, "recalculating", false))
	 })
    }
}

export function isRecalculatingNudges(state) {
    return getGlobalEntityFlag(ENTITY_KEY__NUDGE, state, "recalculating") === true
}

export function updateNudgeMienHeaders(mien_id, headers) {
    return updateMienHeaders(mien_id, HEADER_LIST_NAME__NUDGE, headers)
}

export function getNudgeHeaderListForMien(mien) {
    return getHeaderListForMien(mien, HEADER_LIST_NAME__NUDGE)
}

export function getNudgeHeaderListForCurrentMien(state) {
    return getHeaderListForCurrentMien(state, HEADER_LIST_NAME__NUDGE) || getDefaultNudgeHeaders()
}

export function getDefaultNudgeHeaders() {
    return DEFAULT_NUDGE_HEADERS
}

export function getAllAvailableNudgeHeaders() {
    return ALL_AVAILABLE_NUDGE_HEADERS
}
