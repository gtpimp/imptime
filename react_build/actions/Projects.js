import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'

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

function announceProjectsLoaded(list_key, projects_by_id) {
    return {
        type: ANNOUNCE_PROJECTS_LOADED,
        projects_by_id: projects_by_id,
	list_key: list_key,
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

function fetchProjects(project_ids) {
    return dispatch => {
        dispatch(announceLoadingProjects())
        return impfetch('/imp/project', {params:{project_ids:project_ids}})
            .then(response => response.json())
            .then(json => {
                if (json.status != 'success') {
                    dispatch(announceProjectsLoadFailed(json.error_message))
                } else {
                    dispatch(announceProjectsLoaded(json.payload))
                }
            }).catch(function (error) {
                dispatch(announceProjectsLoadFailed("Failed to load projects: " + error.message))
            })
    }
}

function shouldFetchProjects(state, project_ids, list_key) {
    
    const { projects_by_id, ui_context } = state
    const context = (ui_context && ui_context[list_key]) || {}
    const invalidate_items = context.invalidate_items || false
    const visible_project_ids = context.visible_project_ids || []
    const missing_project_ids = difference(visible_project_ids, keys(projects_by_id))
    if (!projects) {
        return true
    } else {
        return projects.items_invalidated
    }
}

export function fetchProjectsIfNeeded(projects_id) {
    return (dispatch, getState) => {
        const state = getState()
        if (shouldFetchProjects(state, projects_id)) {
            return dispatch(fetchProjects(projects_id))
        }
    }
}
