import includes from 'lodash/includes'
import { impfetch, download } from './lib.js'

export const ANNOUNCE_LOADING_PROJECT_STATEMENT = 'ANNOUNCE_LOADING_PROJECT_STATEMENT'
export const ANNOUNCE_PROJECT_STATEMENT_LOADED = 'ANNOUNCE_PROJECT_STATEMENT_LOADED'
export const ANNOUNCE_PROJECT_STATEMENT_LOAD_FAILED = 'ANNOUNCE_PROJECT_STATEMENT_LOAD_FAILED'
export const INVALIDATE_PROJECT_STATEMENT = 'INVALIDATE_PROJECT_STATEMENT'
export const UPDATE_PROJECT_STATEMENT_FILTER = 'UPDATE_PROJECT_STATEMENT_FILTER'

export function invalidateProjectStatement(project_id) {
    project_id = parseInt(project_id, 10)
    return {
        type: INVALIDATE_PROJECT_STATEMENT,
	      project_id_to_invalidate: project_id
    }
}

function announceLoadingProjectStatement(project_id) {
    project_id = parseInt(project_id, 10)
    return {
        type: ANNOUNCE_LOADING_PROJECT_STATEMENT,
	      project_id_to_load: project_id
    }
}

function announceProjectStatementLoaded(payload) {
    const project_statement = payload.project_statement
    return {
        type: ANNOUNCE_PROJECT_STATEMENT_LOADED,
        project_statement: project_statement,
        project_id: project_statement.project_id,
	received_at: Date.now()
    }
}

function announceProjectStatementLoadFailed(error) {
    return {
        type: ANNOUNCE_PROJECT_STATEMENT_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

export function ensureProjectStatementLoaded(project_id, override_filter) {
    project_id = parseInt(project_id, 10)
    return (dispatch, getState) => {
        const state = getState()
        const filter = override_filter || get_project_statement_filter(state)
        if ( isLoadingProjectStatement(state, project_id) ) {
            return
        }
        if ( getProjectStatement(state, project_id) === null ) {
            dispatch(fetchProjectStatement(project_id, filter))
        }
    }
}

function fetchProjectStatement(project_id, filter) {
    project_id = parseInt(project_id, 10)
    return (dispatch, getState) => {
        const state = getState()
        const params = { filter: filter }
	dispatch(announceLoadingProjectStatement(project_id))
	return impfetch(state, 'imp/project_statement/'+project_id+'/', dispatch, {params:params})
            .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceProjectStatementLoadFailed(json.error))
                } else {
                    dispatch(announceProjectStatementLoaded(json.payload))
                }
	    }).catch(function (error) {
		dispatch(announceProjectStatementLoadFailed("Failed to load project statment: " + error))
	    })
    }
}

export function getProjectStatement(state, project_id) {
    project_id = parseInt(project_id, 10)
    return ((state.project_statement || {}).items_by_project_id || {})[project_id] || null
}

export function isLoadingProjectStatement(state, project_id) {
    project_id = parseInt(project_id, 10)
    const loading_ids = (state.project_statement || {}).loading_project_ids || []
    return includes(loading_ids, project_id)
}

export function update_project_statement_filter(date_from_inclusive, date_to_inclusive, sprint_ids) {
    return (dispatch, getState) => {
        dispatch({
            type: UPDATE_PROJECT_STATEMENT_FILTER,
            date_from_inclusive: date_from_inclusive,
            date_to_inclusive: date_to_inclusive,
            sprint_ids: sprint_ids || null
        })
    }
}

export function get_project_statement_filter(state) {
    return state.project_statement.filter
}

export function download_sprint_budgets(project_id) {
    return (dispatch, getState) => {
        const state = getState()
        const url = 'imp/project_statement/'+project_id+'/download_sprint_budgets/'
        const filter = get_project_statement_filter(state)
        return download(state, url, filter)
    }
}

export function download_sprint_breakdown(project_id) {
    return (dispatch, getState) => {
        const state = getState()
        const url = 'imp/project_statement/'+project_id+'/download_sprint_breakdown/'
        const filter = get_project_statement_filter(state)
        return download(state, url, filter)
    }
}

export function download_issues_worked_on(project_id) {
    return (dispatch, getState) => {
        const state = getState()
        const url = 'imp/project_statement/'+project_id+'/download_issues_worked_on/'
        const filter = get_project_statement_filter(state)
        return download(state, url, filter)
    }
}
