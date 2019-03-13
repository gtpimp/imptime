import { impfetch } from '../actions/lib'
import {
    getGloballySelectedEntityIds
} from './Page'

export const UPDATE_GLOBAL_FILTER = 'UPDATE_GLOBAL_FILTER'
export const INIT_FILTER = 'INIT_FILTER'
export const CLEAR_FILTER = 'CLEAR_FILTER'
export const CLEAR_FILTER_RESULTS = 'CLEAR_FILTER_RESULTS'
export const ANNOUNCE_FILTER_LOADING = 'ANNOUNCE_FILTER_LOADING'
export const ANNOUNCE_FILTER_LOADED = 'ANNOUNCE_FILTER_LOADED'
export const ANNOUNCE_FILTER_LOAD_FAILED = 'ANNOUNCE_FILTER_LOAD_FAILED'
export const CHANGE_FILTER_DISPLAY_STATE = 'CHANGE_FILTER_DISPLAY_STATE'

export function initFilter(filter_key) {
    const url = 'imp/filter/'
    return {
        type: INIT_FILTER,
        filter_key: filter_key,
        url: url
    }
}

export function showResults(filter_key) {
    return {
        type: CHANGE_FILTER_DISPLAY_STATE,
        filter_key: filter_key,
        is_visible: true
    }
}

export function hideResults(filter_key) {
    return {
        type: CHANGE_FILTER_DISPLAY_STATE,
        filter_key: filter_key,
        is_visible: false
    }
}

export function clearResults(filter_key) {
    return {
        type: CLEAR_FILTER_RESULTS,
        filter_key: filter_key
    }
}

export function clearFilter(filter_key) {
    return {
        type: CLEAR_FILTER,
        filter_key: filter_key
    }
}

function announceFilterLoading(filter_key, term) {
    return {
        type: ANNOUNCE_FILTER_LOADING,
        filter_key: filter_key,
        term: term
    }
}

function announceFilterLoaded(filter_key, term, results) {
    return {
        type: ANNOUNCE_FILTER_LOADED,
        term: term,
        filter_key: filter_key,
        results: results,
    }
}

function announceFilterLoadFailed(filter_key, error) {
    return {
        type: ANNOUNCE_FILTER_LOAD_FAILED,
        filter_key: filter_key,
        error: error
    }
}

export function runFilter(filter_key, term) {

    return (dispatch, getState) => {
        const state = getState()
        const filter = getFilter(state, filter_key)
	dispatch(announceFilterLoading(filter_key, term))

        const selected_entity_ids = getGloballySelectedEntityIds(state) || {}
	const params = { filter: { term: term,
                                   selected_project_ids: selected_entity_ids.project_ids,
                                   selected_sprint_ids: selected_entity_ids.sprint_ids,
                                   selected_issue_ids: selected_entity_ids.issue_ids } }

        return impfetch(state, filter.url, dispatch, {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceFilterLoadFailed(filter_key, term, json.error))
                } else {
		    dispatch(announceFilterLoaded(filter_key, term, json.payload))
                }
	    }).catch(function (error) {
		dispatch(announceFilterLoadFailed(filter_key, term, "Failed to run filter: " + (error || {}).message))
                throw(error)
	    })
    }
}

export function getFilter(state, filter_key) {
    return ((state.filter || {})[filter_key] || {}) || null
}
