import includes from 'lodash/includes'
import { impfetch } from './lib.js'

export const ANNOUNCE_LOADING_PROJECT_STATEMENT = 'ANNOUNCE_LOADING_PROJECT_STATEMENT'
export const ANNOUNCE_PROJECT_STATEMENT_LOADED = 'ANNOUNCE_PROJECT_STATEMENT_LOADED'
export const ANNOUNCE_PROJECT_STATEMENT_LOAD_FAILED = 'ANNOUNCE_PROJECT_STATEMENT_LOAD_FAILED'
export const INVALIDATE_PROJECT_STATEMENT = 'INVALIDATE_PROJECT_STATEMENT'

export function invalidateProjectStatement(project_id) {
    project_id = parseInt(project_id)
    return {
        type: INVALIDATE_PROJECT_STATEMENT,
	      project_id_to_invalidate: project_id
    }
}

function announceLoadingProjectStatement(project_id) {
    project_id = parseInt(project_id)
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

export function ensureProjectStatementLoaded(project_id) {
    project_id = parseInt(project_id)
    return (dispatch, getState) => {
        const state = getState()
        if ( isLoadingProjectStatement(state, project_id) ) {
            return
        }
        if ( getProjectStatement(state, project_id) === null ) {
            dispatch(fetchProjectStatement(project_id))
        }
    }
}

function fetchProjectStatement(project_id) {
    project_id = parseInt(project_id)
    return (dispatch, getState) => {
        const state = getState()
	      dispatch(announceLoadingProjectStatement(project_id))
	      return impfetch(state, 'imp/project_statement/'+project_id+'/', dispatch)
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
    project_id = parseInt(project_id)
    return ((state.project_statement || {}).items_by_project_id || {})[project_id] || null
}

export function isLoadingProjectStatement(state, project_id) {
    project_id = parseInt(project_id)
    const loading_ids = (state.project_statement || {}).loading_project_ids || []
    return includes(loading_ids, project_id)
}
