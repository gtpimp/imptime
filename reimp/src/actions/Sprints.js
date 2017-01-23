import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import indexOf from 'lodash/indexOf'
import map from 'lodash/map'
import { fetchListIfNeeded } from './ItemList'
import { ENTITY_KEY__SPRINT } from '../actions/ItemListKeyRegistry'
import { API_BASE_URL } from '../settings'

export const ANNOUNCE_SPRINTS_LOADED = 'ANNOUNCE_SPRINTS_LOADED'
export const ANNOUNCE_SPRINTS_LOAD_FAILED = 'ANNOUNCE_SPRINTS_LOAD_FAILED'
export const ANNOUNCE_LOADING_SPRINTS = 'ANNOUNCE_LOADING_SPRINTS'
export const ANNOUNCE_SPRINTS_SAVED = 'ANNOUNCE_SPRINTS_SAVED'
export const ANNOUNCE_SPRINTS_SAVE_FAILED = 'ANNOUNCE_SPRINTS_SAVE_FAILED'
export const ANNOUNCE_SAVING_SPRINTS = 'ANNOUNCE_SAVING_SPRINTS'
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

    let items_by_id = {}
    payload.sprints.map((item, index) => {
        items_by_id[item.id] = item
    });
    
    return {
        type: ANNOUNCE_SPRINTS_LOADED,
        items_by_id: items_by_id,
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

function announceSavingSprints(sprint_ids) {
    return {
        type: ANNOUNCE_SAVING_SPRINTS,
	sprint_ids_to_save: sprint_ids
    }
}

function announceSprintsSaved(sprint_ids) {

    return {
        type: ANNOUNCE_SPRINTS_SAVED,
	save_at: Date.now(),
	sprint_ids: sprint_ids
    }
}

function announceSprintsSaveFailed(error) {
    return {
        type: ANNOUNCE_SPRINTS_SAVE_FAILED,
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



export function reorderSprints(sprint_id_before, sprint_id_after, on_done) {

    return (dispatch, getState) => {

	const state = getState()
	const saving_sprint_ids = state.sprint.saving_item_ids || []
	if (indexOf(saving_sprint_ids, sprint_id_before) !== -1 ||
	    indexOf(saving_sprint_ids, sprint_id_after) !== -1) {

	    // do nothing, already saving
	    return
	}
	
	dispatch(announceSavingSprints([sprint_id_before, sprint_id_after]))

	const data = { sprint_id_before: sprint_id_before,
		       sprint_id_after: sprint_id_after }
	
        return impfetch(API_BASE_URL+'imp/sprint/'+sprint_id_before+'/', {method: "PUT",
					 credentials: 'same-origin',
					 data: data,
					 headers: {"Content-type": "application/json; charset=UTF-8"}, 
					 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if (json.status != 'success') {
		 dispatch(announceSprintsSaveFailed())
             } else {
		 dispatch(announceSprintsSaved([sprint_id_before, sprint_id_after]))
		 if ( on_done ) {
		     on_done()
		 }
             }
	 }).catch(function (error) {
	     dispatch(announceSprintsSaveFailed("Failed to save sprints: " + error.message))
	 })
    }
}

function fetchSprintsPromise(dispatch, sprint_ids) {
    return new Promise(function(resolve, reject) {
	dispatch(announceLoadingSprints(sprint_ids))

	const params = { filter: { ids: sprint_ids },
			 pagination: {'enabled': false} }
	
        return impfetch(API_BASE_URL+'imp/sprint/', {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status != 'success') {
		    dispatch(announceSprintsLoadFailed())
		    reject(json.error)
                } else {
		    dispatch(announceSprintsLoaded(json.payload))
		    resolve(json.payload)
                }
	    }).catch(function (error) {
		dispatch(announceSprintsLoadFailed("Failed to load sprints: " + error.message))
		reject("Failed to load sprints: " + error.message)
	    })
    })
}

export function fetchSprintsIfNeeded(list_key) {
    const matching_items_key = ENTITY_KEY__SPRINT
    const matching_items_promise_func = fetchSprintsPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}

export function startCandidateSprint(list_key) {
    return (dispatch, getState) => {
	const state = getState()
	const sprints_by_id = state.sprint.items_by_id
	const l = state.item_list[list_key]

	const selected_ids = l.selected_ids

	let sprint_id_before = null
	if ( selected_ids.length > 0 ) {
	    sprint_id_before = selected_ids[0]
	    const sprint_before = sprints_by_id[sprint_id_before] 
	}
	
	dispatch({
	    type: ANNOUNCE_CAPTURING_NEW_SPRINT,
	    sprint_id_before: sprint_id_before,
	    project_id: l.filter.project_id
	})
    }
}

export function updateCandidateTitle(title) {
    return {
	type: UPDATE_NEW_SPRINT_DETAILS,
	candidate_sprint: { "title": title }
    }
}

export function cancelCandidateSprint() {
    return {
	type: CANCEL_CREATING_NEW_SPRINT
    }
}

export function saveCandidateSprint() {

    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceCandidateSprintSaving())
	let data = {sprint: state.sprint.candidate_sprint}
	
	return impfetch(API_BASE_URL+"imp/sprint/",
			{method: "POST",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"}, 
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status != 'success' ) {
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
