import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import map from 'lodash/map'
import { fetchListIfNeeded } from './ItemList'

export const ANNOUNCE_PROJECTS_LOADED = 'ANNOUNCE_PROJECTS_LOADED'
export const ANNOUNCE_PROJECTS_LOAD_FAILED = 'ANNOUNCE_PROJECTS_LOAD_FAILED'
export const ANNOUNCE_LOADING_PROJECTS = 'ANNOUNCE_LOADING_PROJECTS'
export const INVALIDATE_PROJECTS = 'INVALIDATE_PROJECTS'

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

export function refreshProjects(list_key) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(list_key))
        dispatch(fetchItems(list_key))
    }
}

function announceProjectsLoaded(payload) {

    let items_by_id = {}
    payload.projects.map((item, index) => {
        items_by_id[item.id] = item
    });

    return {
        type: ANNOUNCE_PROJECTS_LOADED,
        items_by_id: items_by_id,
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

function fetchProjectsPromise(dispatch, project_ids) {
    return new Promise(function(resolve, reject) {
	dispatch(announceLoadingProjects(project_ids))

	const params = { filter: { ids: project_ids },
			 pagination: {'enabled': false} }
	
        return impfetch('/imp/project/', {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status != 'success') {
		    dispatch(announceProjectsLoadFailed())
		    reject(json.error)
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
    const matching_items_key = 'project'
    const matching_items_promise_func = fetchProjectsPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}
