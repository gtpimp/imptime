import { impfetch } from './lib.js'

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

function announceProjectsLoaded(context_key, projects_by_id) {
    return {
        type: ANNOUNCE_PROJECTS_LOADED,
        projects_by_id: projects_by_id,
	context_key: context_key,
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

function fetchProjects(projects_id) {
    return dispatch => {
        dispatch(announceLoadingProjects)
        return impfetch('/imp/project')
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

function shouldFetchProjects(state, projects_id) {
    const projects = state.projectss.projectss_by_id[projects_id]
    if (!projects) {
        return true
    } else if (projects.isFetching) {
        return false
    } else {
        return projects.didInvalidate
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
