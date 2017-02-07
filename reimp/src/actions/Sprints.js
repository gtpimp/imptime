import { impfetch } from './lib.js'
import indexOf from 'lodash/indexOf'
import keyBy from 'lodash/keyBy'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__SPRINT } from '../actions/ItemListKeyRegistry'

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
        const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
	dispatch(announceLoadingSprints(sprint_ids))

	const params = { filter: { ids: sprint_ids },
			 pagination: {'enabled': false} }
	
        return impfetch(API_BASE_URL+'imp/sprint/', dispatch, {params:params})
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

export function startCandidateSprint(project_id, sprint_id_before) {
    return (dispatch, getState) => {
	const state = getState()
	dispatch({
	    type: ANNOUNCE_CAPTURING_NEW_SPRINT,
	    project_id: project_id,
            sprint_id_before: sprint_id_before
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

export function reorderSprints(sprint_id_before, sprint_id_after, on_done) {
    return updateSprint([sprint_id_before], "sprint_id_after", sprint_id_after, on_done)
}

export function saveCandidateSprint() {

    return (dispatch, getState) => {
	const state = getState()
        const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
	dispatch(announceCandidateSprintSaving())
	let data = {sprint: state.sprint.candidate_sprint}
	
	return impfetch(API_BASE_URL+"imp/sprint/", dispatch,
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
        const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
	dispatch(announceSprintsSaving(sprint_ids, field_name, new_value))
	let data = {sprint_ids: sprint_ids,
                    field_name: field_name,
		    value: new_value }
	return impfetch(API_BASE_URL+"imp/sprint/"+sprint_ids[0]+"/", dispatch,
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
