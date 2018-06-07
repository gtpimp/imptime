import { impfetch } from './lib.js'
import { filter, includes } from 'lodash'
import {
    ENTITY_KEY__NUDGE,
    HEADER_LIST_NAME__NUDGE,
    medium_col_width,
    small_col_width,
    large_col_width
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
import { updateVisibleItemIdAbove } from './ItemList'
import {
    updateMienHeaders,
    getHeaderListForCurrentMien,
    getHeaderListForMien
} from '../actions/Mien'

export var ALL_AVAILABLE_NUDGE_HEADERS =
    [ {key:'select', label:'', description:'Select', width:small_col_width},
      {key:'reason', label:'Reason', description:'Reason for the nudge', width:medium_col_width},
      {key:'description', label:'Description', description:'Description of the nudge', width:large_col_width},
      {key:'user', label:'User', description:'User', width:small_col_width},
      {key:'project', label:'Project', description:'Project', width:small_col_width},
      {key:'sprint', label:'Sprint', description:'Sprint', width:large_col_width},
      {key:'issue', label:'Issue', description:'Issue', width:large_col_width},
      {key:'due_date', label:'Due at', description:'Due date for resolving the issue', width:medium_col_width},
      {key:'due_date_reason', label:'Due date reason', description:'Why this nudge should be resolved at the due date', width:large_col_width},
      {key:'modified', label:'Refreshed at', description:'When this nudge was last refreshed ', width:medium_col_width},
    ]

const DEFAULT_NUDGE_HEADERS_KEYS = ["select", "reason", "description", "project", "sprint", "issue", "due_date"]
const DEFAULT_NUDGE_HEADERS = filter(ALL_AVAILABLE_NUDGE_HEADERS, (header) => includes(DEFAULT_NUDGE_HEADERS_KEYS, header.key))


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

export function reorderNudge(moving_nudge_ids, nudge_id_after, list_key, index_of_destination, on_done) {
    return (dispatch, getState) => {
        dispatch(updateVisibleItemIdAbove(list_key, moving_nudge_ids, nudge_id_after, index_of_destination))
        dispatch(updateItem(ENTITY_KEY__NUDGE, moving_nudge_ids, "nudge_id_after", nudge_id_after, on_done))
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
    return getHeaderListForMien(mien, HEADER_LIST_NAME__NUDGE) || getDefaultNudgeHeaders()
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
