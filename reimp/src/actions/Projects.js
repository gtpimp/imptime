import { impfetch } from './lib.js'
import { keyBy, get } from 'lodash'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__PROJECT } from '../actions/ItemListKeyRegistry'
import { deleteItems } from '../actions/Item'

export const ANNOUNCE_PROJECTS_SAVING = 'ANNOUNCE_PROJECTS_SAVING'
export const ANNOUNCE_PROJECTS_SAVED = 'ANNOUNCE_PROJECTS_SAVED'
export const ANNOUNCE_PROJECT_SAVE_FAILED = 'ANNOUNCE_PROJECT_SAVE_FAILED'

export const ANNOUNCE_PROJECTS_LOADED = 'ANNOUNCE_PROJECTS_LOADED'
export const ANNOUNCE_PROJECTS_LOAD_FAILED = 'ANNOUNCE_PROJECTS_LOAD_FAILED'
export const ANNOUNCE_LOADING_PROJECTS = 'ANNOUNCE_LOADING_PROJECTS'
export const INVALIDATE_PROJECTS = 'INVALIDATE_PROJECTS'
export const INVALIDATE_ALL_PROJECTS = 'INVALIDATE_ALL_PROJECTS'

export const ANNOUNCE_CAPTURING_NEW_PROJECT = 'ANNOUNCE_CAPTURING_NEW_PROJECT'
export const UPDATE_NEW_PROJECT_DETAILS = 'UPDATE_NEW_PROJECT_DETAILS'
export const CANCEL_CREATING_NEW_PROJECT = 'CANCEL_CREATING_NEW_PROJECT'
export const ANNOUNCE_SAVING_NEW_PROJECT = 'ANNOUNCE_SAVING_NEW_PROJECT'
export const ANNOUNCE_SAVED_NEW_PROJECT = 'ANNOUNCE_SAVED_NEW_PROJECT'
export const ANNOUNCE_SAVING_NEW_PROJECT_FAILED = 'ANNOUNCE_SAVING_NEW_PROJECT_FAILED'

export const ANNOUNCE_SAVING_INVITE = 'ANNOUNCE_SAVING_INVITE'
export const ANNOUNCE_SAVED_INVITE = 'ANNOUNCE_SAVED_INVITE'
export const ANNOUNCE_SAVE_INVITE_FAILED = 'ANNOUNCE_SAVE_INVITE_FAILED'
export const SET_LAST_SELECTED_PROJECT = 'SET_LAST_SELECTED_PROJECT'

export function invalidateAllProjects() {
    return {
        type: INVALIDATE_ALL_PROJECTS
    }
}

export function invalidateProjects(project_ids) {
    return {
        type: INVALIDATE_PROJECTS,
	      project_ids_to_invalidate: project_ids
    }
}



function announceLoadingProjects(project_ids) {
    return {
        type: ANNOUNCE_LOADING_PROJECTS,
	      project_ids_to_load: project_ids
    }
}

function announceProjectsLoaded(payload) {
    return {
        type: ANNOUNCE_PROJECTS_LOADED,
        items_by_id: keyBy(payload.projects, 'id'),
	      received_at: Date.now()
    }
}

function announceProjectsLoadFailed(error) {
    return {
        type: ANNOUNCE_PROJECTS_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function announceCandidateProjectSaving() {
    return {
        type: ANNOUNCE_SAVING_NEW_PROJECT
    }
}

function announceCandidateProjectSaved(new_project) {
    return {
        type: ANNOUNCE_SAVED_NEW_PROJECT,
	      project: new_project
    }
}

function announceCandidateProjectSaveFailed(error) {
    return {
	      type: ANNOUNCE_SAVING_NEW_PROJECT_FAILED,
	      error: error
    }
}

function fetchProjectsPromise(dispatch, state, project_ids) {
    return new Promise(function(resolve, reject) {
	      dispatch(announceLoadingProjects(project_ids))

	      const params = { filter: { ids: project_ids },
			                   pagination: {'enabled': false} }

        return impfetch(state, 'imp/project/', dispatch, {params:params})
	          .then(response => response.json())
	          .then(json => {
                if (json.status !== 'success') {
		                dispatch(announceProjectsLoadFailed())
		                reject(json.error)
                } else {
		                dispatch(announceProjectsLoaded(json.payload))
		                resolve(json.payload)
                }
	          }).catch(function (error) {
		            dispatch(announceProjectsLoadFailed("Failed to load projects: " + error))
		            reject("Failed to load projects: " + error)
	          })
    })
}

export function fetchProjectsIfNeeded(list_key) {
    const matching_items_key = ENTITY_KEY__PROJECT
    const matching_items_promise_func = fetchProjectsPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}

export function deleteProjects(project_ids) {
    return deleteItems(ENTITY_KEY__PROJECT, project_ids)
}

export function startCandidateProject() {
    return (dispatch, getState) => {
	      dispatch({
	          type: ANNOUNCE_CAPTURING_NEW_PROJECT
	      })
    }
}

export function updateCandidateName(name) {
    return {
	      type: UPDATE_NEW_PROJECT_DETAILS,
	      candidate_project: { "name": name }
    }
}

export function cancelCandidateProject() {
    return {
	      type: CANCEL_CREATING_NEW_PROJECT
    }
}

export function updateProjectName(project_id, value) {
    return updateProject([project_id], "name", value)
}

export function updateProjectDescription(project_id, value) {
    return updateProject([project_id], "description", value)
}

export function saveCandidateProject() {

    return (dispatch, getState) => {
	      const state = getState()
	      dispatch(announceCandidateProjectSaving())
	      let data = {project: state[ENTITY_KEY__PROJECT].candidate_project}

	      return impfetch(state, "imp/project/", dispatch,
			                  {method: "POST",
			                   credentials: 'same-origin',
			                   data: data,
			                   headers: {"Content-type": "application/json; charset=UTF-8"},
			                   body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceCandidateProjectSaveFailed(json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
		             dispatch(announceCandidateProjectSaved(json.payload.project))
             }
	       })
	       .catch(function (error) {
             console.log('Request failed', error);
	           dispatch(announceCandidateProjectSaveFailed(error))
	       })
    }

}

export function ensureProjectsLoaded(project_ids) {
    return (dispatch, getState) => {
        const state = getState()
        const project_ids_to_load = getMissingItemIds(state, project_ids, ENTITY_KEY__PROJECT)
        if ( project_ids_to_load.length > 0 ) {
            fetchProjectsPromise(dispatch, state, project_ids_to_load)
        }
    }
}

export function getProject(state, project_id) {
    return ((state[ENTITY_KEY__PROJECT] || {}).items_by_id || {})[project_id] || null
}

export function getProjects(state, project_ids) {
    const project_objs = state[ENTITY_KEY__PROJECT]
    const items_by_id = (project_objs && project_objs.items_by_id) || {}
    return items_by_id && project_ids && project_ids.map(function (project_id, index) {
        return items_by_id[project_id] || {
            'id': project_id,
            'loaded': false
        }
    })
}

export function getCandidateProject(state) {
    const project_objs = state[ENTITY_KEY__PROJECT] || {}
    return project_objs.candidate_project
}

function announceProjectSaveFailed(error) {
    return {
        type: ANNOUNCE_PROJECT_SAVE_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function announceProjectsSaved(project_ids) {
    return {
        type: ANNOUNCE_PROJECTS_SAVED,
        project_ids: project_ids,
        saved_at: Date.now()
    }
}

function announceProjectsSaving(project_ids, field_name, new_value) {
    return {
        type: ANNOUNCE_PROJECTS_SAVING,
        project_ids: project_ids,
	      field_name: field_name,
	      new_value: new_value
    }
}

function updateProject(project_ids, field_name, new_value, on_done) {
    return (dispatch, getState) => {
        const state = getState()
	      dispatch(announceProjectsSaving(project_ids, field_name, new_value))
	      let data = {project_ids: project_ids,
                    field_name: field_name,
		                value: new_value }
	      return impfetch(state, "imp/project/"+project_ids[0]+"/", dispatch,
			                  {method: "PUT",
			                   credentials: 'same-origin',
			                   data: data,
			                   headers: {"Content-type": "application/json; charset=UTF-8"},
			                   body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceProjectSaveFailed(json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
                 dispatch(announceProjectsSaved(project_ids))
             }
	           if ( on_done ) {
		             on_done()
	           }
	       })
	       .catch(function (error) {
             console.log('Request failed', error);
	           dispatch(announceProjectSaveFailed(error))
	       })
    }
}

function announceSavingInvite(user_email, project_id) {
    return {
        type: ANNOUNCE_SAVING_INVITE,
        user_email: user_email,
        project_id: project_id
    }
}

function announceInviteSaved(user_email, project_id, payload) {
    return {
        type: ANNOUNCE_SAVED_INVITE,
        user_email: user_email,
        project_id: project_id,
        payload: payload
    }
}

function announceInviteSaveFailed(user_email, project_id, error) {
    return {
        type: ANNOUNCE_SAVE_INVITE_FAILED,
        user_email: user_email,
        project_id: project_id,
        error: error
    }
}

export function saveInviteUser(project_id, user_email) {

    return (dispatch, getState) => {
	      const state = getState()
	      dispatch(announceSavingInvite())
	      let data = {user_email: user_email}

	      return impfetch(state, "imp/project/"+project_id+"/invite/", dispatch,
			                  {method: "POST",
			                   credentials: 'same-origin',
			                   data: data,
			                   headers: {"Content-type": "application/json; charset=UTF-8"},
			                   body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceInviteSaveFailed(user_email, project_id, json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
		             dispatch(announceInviteSaved(user_email, project_id, json.payload))
             }
	       })
	       .catch(function (error) {
             console.log('Request failed', error);
	           dispatch(announceInviteSaveFailed(user_email, project_id, error))
	       })
    }

}

export function canShowProjectDelete(project) {
    return project.can_delete_project || false
}

export function is_project_invalidated(state, project_id) {
    return get(state, ["project", "invalidated_item_ids"], []).indexOf(project_id) !== -1
}

export function setLastSelectedProjectId(project_id) {
    return {
        type: SET_LAST_SELECTED_PROJECT,
        project_id: project_id
    }
}
