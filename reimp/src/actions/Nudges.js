import { impfetch } from './lib.js'
import {
    ENTITY_KEY__NUDGE,
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
    getGlobalEntityFlag,
    itemPost
} from '../actions/Item'
import { updateVisibleItemIdAbove } from './ItemList'

export var ALL_AVAILABLE_NUDGE_HEADERS =
    [ {key:'select', label:'', description:'Select', width:small_col_width, is_default:true},
      {key:'reason', label:'Reason', description:'Reason for the nudge', width:medium_col_width, is_default:true},
      {key:'description', label:'Description', description:'Description of the nudge', width:large_col_width, is_default:true},
      {key:'user', label:'User', description:'User', width:small_col_width},
      {key:'project', label:'Project', description:'Project', width:small_col_width, is_default:true},
      {key:'sprint', label:'Sprint', description:'Sprint', width:large_col_width, is_default:true},
      {key:'issue', label:'Issue', description:'Issue', width:large_col_width, is_default:true},
      {key:'issue_status', label:'Issue status', description:'Status', width:medium_col_width},
      {key:'estimated_start_at', label:'Start at', description:'Estimated start date', width:small_col_width},
      {key:'estimated_end_at', label:'End at', description:'Estimated end date', width:small_col_width},
      {key:'estimated_hours', label:'Duration', description:'Estimated duration of the nudge', width:small_col_width},
      {key:'due_date', label:'Due at', description:'Due date for resolving the issue', width:medium_col_width},
      {key:'due_date_reason', label:'Due date reason', description:'Why this nudge should be resolved at the due date', width:large_col_width},
      {key:'modified', label:'Refreshed at', description:'When this nudge was last refreshed ', width:medium_col_width},
      {key:'out_of_sequence_warning', label:'Out of sequence', description:'Indicates if there are more important issues in this sprint to be attended to', width:small_col_width},
      {key:'actions', label:'Actions', description:'Action buttons', width:medium_col_width, is_default:true}
    ]

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

export function convertIssuesToNudges(schedule_id, issue_ids) {
    const url = "imp/" + ENTITY_KEY__NUDGE + "/convertIssuesToNudges/"
    const field_name = "issue_ids"
    const field_value = issue_ids
    const method = "POST"
    const data = {issue_ids: issue_ids,
                  schedule_id: schedule_id}
    return itemPost(ENTITY_KEY__NUDGE, [issue_ids], url, field_name, field_value, method, data)
}

export function isRecalculatingNudges(state) {
    return getGlobalEntityFlag(ENTITY_KEY__NUDGE, state, "recalculating") === true
}
