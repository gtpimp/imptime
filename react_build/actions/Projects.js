import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import map from 'lodash/map'
import { fetchListIfNeeded } from './ItemList'

export const ANNOUNCE_PROJECTS_LOADED = 'ANNOUNCE_PROJECTS_LOADED'
export const ANNOUNCE_PROJECTS_LOAD_FAILED = 'ANNOUNCE_PROJECTS_LOAD_FAILED'
export const ANNOUNCE_LOADING_PROJECTS = 'ANNOUNCE_LOADING_PROJECTS'
export const INVALIDATE_PROJECTS = 'INVALIDATE_PROJECTS'

export function invalidateProjects() {
    return {
        type: INVALIDATE_PROJECTS
    }
}

function announceLoadingProjects() {
    return {
        type: ANNOUNCE_LOADING_PROJECTS
    }
}

function announceProjectsLoaded(projects) {
    return {
        type: ANNOUNCE_PROJECTS_LOADED,
        projects_by_id: map(projects, 'id'),
        received_at: Date.now()
    }
}

function announceProjectsLoadFailed(error_message) {
    return {
        type: ANNOUNCE_PROJECTS_LOAD_FAILED,
        error_message: error_message,
        receivedAt: Date.now()
    }
}

function fetchProjectsPromise(dispatch, project_ids) {
    return new Promise(function(resolve, reject) {
	dispatch(announceLoadingProjects())
        return impfetch('/imp/project/', {params:{project_ids:project_ids}})
	    .then(response => response.json())
	    .then(json => {
                if (json.status != 'success') {
		    dispatch(announceProjectsLoadFailed())
		    reject(json.error_message)
                } else {
		    dispatch(announceProjectsLoaded(json.payload))
                }
	    }).catch(function (error) {
		dispatch(announceProjectsLoadFailed("Failed to load projects: " + error.message))
		reject("Failed to load projects: " + error.message)
	    })
    })
}

export function fetchProjectsIfNeeded(list_key) {
    return (dispatch, getState) => {
	const list_key = list_key
	const matching_items_key = 'project'
	const matching_items_promise_func = fetchProjectsPromise
	dispatch(fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func))
    }
}
