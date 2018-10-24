import { impfetch } from './lib.js'
import { keyBy, filter, includes } from 'lodash'
import { fetchListIfNeeded, getMissingItemIds, updateVisibleItemIdAbove } from './ItemList'
import {
    ENTITY_KEY__SPRINT,
    HEADER_LIST_NAME__SPRINT,
    small_col_width,
    large_col_width
} from './ItemListKeyRegistry'
import {
    updateMienHeaders,
    getHeaderListForCurrentMien,
    getHeaderListForMien
} from '../actions/Mien'

export const ANNOUNCE_SPRINTS_SAVING = 'ANNOUNCE_SPRINTS_SAVING'
export const ANNOUNCE_SPRINTS_SAVED = 'ANNOUNCE_SPRINTS_SAVED'
export const ANNOUNCE_SPRINT_SAVE_FAILED = 'ANNOUNCE_SPRINT_SAVE_FAILED'

export const ANNOUNCE_SPRINTS_LOADED = 'ANNOUNCE_SPRINTS_LOADED'
export const ANNOUNCE_SPRINTS_LOAD_FAILED = 'ANNOUNCE_SPRINTS_LOAD_FAILED'
export const ANNOUNCE_LOADING_SPRINTS = 'ANNOUNCE_LOADING_SPRINTS'
export const INVALIDATE_SPRINTS = 'INVALIDATE_SPRINTS'
export const INVALIDATE_ALL_SPRINTS = 'INVALIDATE_ALL_SPRINTS'

export const ANNOUNCE_CAPTURING_NEW_SPRINT = 'ANNOUNCE_CAPTURING_NEW_SPRINT'
export const UPDATE_NEW_SPRINT_DETAILS = 'UPDATE_NEW_SPRINT_DETAILS'
export const CANCEL_CREATING_NEW_SPRINT = 'CANCEL_CREATING_NEW_SPRINT'
export const ANNOUNCE_SAVING_NEW_SPRINT = 'ANNOUNCE_SAVING_NEW_SPRINT'
export const ANNOUNCE_SAVED_NEW_SPRINT = 'ANNOUNCE_SAVED_NEW_SPRINT'
export const ANNOUNCE_SAVING_NEW_SPRINT_FAILED = 'ANNOUNCE_SAVING_NEW_SPRINT_FAILED'

export const ANNOUNCE_CLONING_SPRINT = 'ANNOUNCE_CLONING_SPRINT'
export const ANNOUNCE_CLONED_SPRINT = 'ANNOUNCE_CLONED_SPRINT'
export const ANNOUNCE_CLONE_SPRINT_FAILED = 'ANNOUNCE_CLONE_SPRINT_FAILED'

export var ALL_AVAILABLE_SPRINT_HEADERS =
    [ {key:'name', label:'name', description:'Name', width:large_col_width},
      {key:'ref', label:'Ref', description:'Reference', width:small_col_width},
      {key:'number', label:'number', description:'Number', width:small_col_width},
      {key:'state_summary', label:'State Summary', description:'State summary indicating problems', width:large_col_width},
      {key:'start_time', label:"First clock", description:"First clocked time on this sprint", width:small_col_width},
      {key:'end_time', label:"Last clock", description:"Last clocked time on this sprint", width:small_col_width},
      {key:'num_issues', label:"Issues", description:"Number of issues", width: small_col_width},
      {key:'num_testable_issues', label:"Testable issues", description:"Number of testable issues", width: small_col_width},
      {key:'has_dev_started', label:"Has dev started", description:"Has time been clocked by the assigned user on any testable issue", width:small_col_width},
      {key:'status', label:"Status", description:"Sprint status", width:small_col_width},
      {key:'type', label:"Type", description:"Sprint type", width:small_col_width},
      {key:'hours_by_assignee', label:"Total clocked hours by assignee", description:"Total actual hours by the assigned user across all testable issues", width:small_col_width},
      {key:'estimates_by_assignee', label:"Total estimated hours by assignee", description:"Total estimated hours by the assigned user across all testable issues", width:small_col_width},
      {key:'open_estimates_by_assignee', label:"Total open estimated hours by assignee", description:"Total estimated hours by the assigned user across open testable issues", width:small_col_width},
    ]

const DEFAULT_SPRINT_HEADERS_KEYS = ["ref",
                                     "name",
                                     "status",
                                     "num_issues",
                                     "state_summary"
                                     ]
const DEFAULT_SPRINT_HEADERS = filter(ALL_AVAILABLE_SPRINT_HEADERS, (header) => includes(DEFAULT_SPRINT_HEADERS_KEYS, header.key))


export function invalidateAllSprints() {
    return {
        type: INVALIDATE_ALL_SPRINTS
    }
}

export function invalidateSprints(sprint_ids) {
    return {
        type: INVALIDATE_SPRINTS,
	      sprint_ids_to_invalidate: sprint_ids
    }
}

function announceLoadingSprints(sprint_ids) {
    return {
        type: ANNOUNCE_LOADING_SPRINTS,
	      sprint_ids_to_load: sprint_ids
    }
}

function announceSprintsLoaded(payload) {
    return {
        type: ANNOUNCE_SPRINTS_LOADED,
        items_by_id: keyBy(payload.sprints, 'id'),
	      received_at: Date.now()
    }
}

function announceSprintsLoadFailed(error) {
    return {
        type: ANNOUNCE_SPRINTS_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function announceCandidateSprintSaving() {
    return {
        type: ANNOUNCE_SAVING_NEW_SPRINT
    }
}

function announceCandidateSprintSaved(new_sprint) {
    return {
        type: ANNOUNCE_SAVED_NEW_SPRINT,
	sprint: new_sprint
    }
}

function announceCandidateSprintSaveFailed(error) {
    return {
	type: ANNOUNCE_SAVING_NEW_SPRINT_FAILED,
	error: error
    }
}

function fetchSprintsPromise(dispatch, state, sprint_ids) {
    return new Promise(function(resolve, reject) {
	dispatch(announceLoadingSprints(sprint_ids))

	const params = { filter: { ids: sprint_ids },
			 pagination: {'enabled': false} }
        return impfetch(state, 'imp/sprint/', dispatch, {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceSprintsLoadFailed())
		    reject(json.error)
                } else {
		    dispatch(announceSprintsLoaded(json.payload))
		    resolve(json.payload)
                }
	    }).catch(function (error) {
		dispatch(announceSprintsLoadFailed("Failed to load sprints: " + error))
		reject("Failed to load sprints: " + error)
	    })
    })
}

export function fetchSprintsIfNeeded(list_key) {
    const matching_items_key = ENTITY_KEY__SPRINT
    const matching_items_promise_func = fetchSprintsPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}

export function startCandidateSprint(project_id, sprint_id_before, default_sprint_args) {
    return (dispatch, getState) => {
	dispatch({
	    type: ANNOUNCE_CAPTURING_NEW_SPRINT,
	    project_id: project_id,
            sprint_id_before: sprint_id_before,
            default_sprint_args: default_sprint_args
	})
    }
}

export function updateCandidateName(name) {
    return {
	type: UPDATE_NEW_SPRINT_DETAILS,
	candidate_sprint: { "name": name }
    }
}

export function cancelCandidateSprint() {
    return {
	type: CANCEL_CREATING_NEW_SPRINT
    }
}

export function updateSprintName(sprint_id, value) {
    return updateSprint([sprint_id], "name", value)
}

export function updateSprintStatus(sprint_ids, value) {
    return updateSprint(sprint_ids, "status_name", value)
}

export function updateSprintType(sprint_ids, value) {
    return updateSprint(sprint_ids, "sprint_type", value)
}

export function updateSprintReviewCycle(sprint_ids, value) {
    return updateSprint(sprint_ids, "review_cycle_days", value)
}

export function updateSprintCommission(sprint_ids, value) {
    return updateSprint(sprint_ids, "commission_percentage", value)
}

export function updateSprintRatios(sprint_ids, value) {
    return updateSprint(sprint_ids, "ratios", value)
}

export function updateSprintBudget(sprint_ids, value) {
    return updateSprint(sprint_ids, "budget", value)
}

export function reorderSprints(sprint_id_before, sprint_id_after, list_key, index_of_destination, on_done) {
    return (dispatch, getState) => {
        dispatch(updateVisibleItemIdAbove(list_key, [sprint_id_before], sprint_id_after, index_of_destination))
        dispatch(updateSprint([sprint_id_before], "sprint_id_after", sprint_id_after, on_done))
    }
}

export function saveCandidateSprint() {

    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceCandidateSprintSaving())
	let data = {sprint: state.sprint.candidate_sprint}

	return impfetch(state, "imp/sprint/", dispatch,
			{method: "POST",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"},
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceCandidateSprintSaveFailed(json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceCandidateSprintSaved(json.payload.sprint))
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceCandidateSprintSaveFailed(error))
	 })
    }
}

export function ensureSprintsLoaded(sprint_ids) {
    return (dispatch, getState) => {
        const state = getState()

        const sprint_ids_to_load = getMissingItemIds(state, sprint_ids, 'sprint')
        if ( sprint_ids_to_load.length > 0 ) {
            fetchSprintsPromise(dispatch, state, sprint_ids_to_load)
        }
    }
}

export function getSprint(state, sprint_id) {
    return ((state.sprint || {}).items_by_id || {})[sprint_id] || null
}

export function getSprints(state, sprint_ids) {
    const sprint_objs = state.sprint
    const items_by_id = (sprint_objs && sprint_objs.items_by_id) || {}
    return items_by_id && sprint_ids && sprint_ids.map(function (sprint_id, index) {
        return items_by_id[sprint_id] || {
            'id': sprint_id,
            'loaded': false
        }
    })
}

export function getCandidateSprint(state) {
    const sprint_objs = state.sprint || {}
    return sprint_objs.candidate_sprint
}

function announceSprintSaveFailed(error) {
    return {
        type: ANNOUNCE_SPRINT_SAVE_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function announceSprintsSaved(sprint_ids) {
    return {
        type: ANNOUNCE_SPRINTS_SAVED,
        sprint_ids: sprint_ids,
        saved_at: Date.now()
    }
}

function announceSprintsSaving(sprint_ids, field_name, new_value) {
    return {
        type: ANNOUNCE_SPRINTS_SAVING,
        sprint_ids: sprint_ids,
	field_name: field_name,
	new_value: new_value
    }
}

function updateSprint(sprint_ids, field_name, new_value, on_done) {
    return (dispatch, getState) => {
        const state = getState()
	dispatch(announceSprintsSaving(sprint_ids, field_name, new_value))
	let data = {sprint_ids: sprint_ids,
                    field_name: field_name,
		    value: new_value }
	return impfetch(state, "imp/sprint/"+sprint_ids[0]+"/", dispatch,
			{method: "PUT",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"},
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceSprintSaveFailed(json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
                 dispatch(announceSprintsSaved(sprint_ids))
             }
	     if ( on_done ) {
		 on_done()
	     }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceSprintSaveFailed(error))
	 })
    }
}

export function announceCloneSprintFailed(sprint_id, error) {
    return {
        type: ANNOUNCE_CLONE_SPRINT_FAILED,
        sprint_id: sprint_id,
        error: error
    }
}

export function announceCloningSprint(sprint_id) {
    return {
        type: ANNOUNCE_CLONING_SPRINT,
        sprint_id: sprint_id
    }
}

export function announceClonedSprint(sprint_id, payload) {
    return {
        type: ANNOUNCE_CLONED_SPRINT,
        sprint_id: sprint_id,
        new_sprint_id: payload.new_sprint_id
    }
}

export function cloneTemplateSprint(sprint_id, onDone) {

    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceCloningSprint(sprint_id))
	let data = {}

	return impfetch(state, "imp/sprint/" + sprint_id + "/clone/", dispatch,
			{method: "POST",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"},
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceCloneSprintFailed(sprint_id, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceClonedSprint(sprint_id, json.payload))
                 if ( onDone ) {
                     onDone(json.payload.new_sprint_id)
                 }
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceCloneSprintFailed(sprint_id, error))
	 })
    }
}

export function is_sprint_invalidated(state, sprint_id) {
    return (((state.sprint || {}).invalidated_item_ids) || []).indexOf(sprint_id) !== -1
}

export function updateSprintMienHeaders(mien_id, headers) {
    return updateMienHeaders(mien_id, HEADER_LIST_NAME__SPRINT, headers)
}

export function getSprintHeaderListForMien(mien) {
    return getHeaderListForMien(mien, HEADER_LIST_NAME__SPRINT) || getDefaultSprintHeaders()
}

export function getSprintHeaderListForCurrentMien(state) {
    return getHeaderListForCurrentMien(state, HEADER_LIST_NAME__SPRINT) || getDefaultSprintHeaders()
}

export function getDefaultSprintHeaders() {
    return DEFAULT_SPRINT_HEADERS
}

export function getAllAvailableSprintHeaders() {
    return ALL_AVAILABLE_SPRINT_HEADERS
}
