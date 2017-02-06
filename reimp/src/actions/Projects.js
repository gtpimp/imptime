import { impfetch } from './lib.js'
import keyBy from 'lodash/keyBy'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__PROJECT } from '../actions/ItemListKeyRegistry'

export const ANNOUNCE_PROJECTS_LOADED = 'ANNOUNCE_PROJECTS_LOADED'
export const ANNOUNCE_PROJECTS_LOAD_FAILED = 'ANNOUNCE_PROJECTS_LOAD_FAILED'
export const ANNOUNCE_LOADING_PROJECTS = 'ANNOUNCE_LOADING_PROJECTS'
export const INVALIDATE_PROJECTS = 'INVALIDATE_PROJECTS'
export const INVALIDATE_ALL_PROJECTS = 'INVALIDATE_ALL_PROJECTS'

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

    // let items_by_id = {}
    // payload.projects.map((item, index) => {
    //     items_by_id[item.id] = item
    // });

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

function fetchProjectsPromise(dispatch, state, project_ids) {
    return new Promise(function(resolve, reject) {
        const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
	dispatch(announceLoadingProjects(project_ids))

	const params = { filter: { ids: project_ids },
			 pagination: {'enabled': false} }
	
        return impfetch(API_BASE_URL+'imp/project/', dispatch, {params:params})
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

export function ensureProjectsLoaded(project_ids) {
    return (dispatch, getState) => {
        const state = getState()

        const project_ids_to_load = getMissingItemIds(state, project_ids, 'project')
        if ( project_ids_to_load.length > 0 ) {
            fetchProjectsPromise(dispatch, state, project_ids_to_load)
        }
    }
}

export function getProject(state, project_id) {
    return ((state.project || {}).items_by_id || {})[project_id] || null
}

export function getProjects(state, project_ids) {
    const project_objs = state.project
    const items_by_id = (project_objs && project_objs.items_by_id) || {}
    return items_by_id && project_ids && project_ids.map(function (project_id, index) {
        return items_by_id[project_id] || {
            'id': project_id,
            'loaded': false
        }
    })    
}

