export const UPDATE_GLOBAL_FILTER = 'UPDATE_GLOBAL_FILTER'

import { impfetch } from '../actions/lib'
export const INIT_FILTER = 'INIT_FILTER'
export const CLEAR_FILTER = 'CLEAR_FILTER'
export const ANNOUNCE_FILTER_LOADING = 'ANNOUNCE_FILTER_LOADING'
export const ANNOUNCE_FILTER_LOADED = 'ANNOUNCE_FILTER_LOADED'
export const ANNOUNCE_FILTER_LOAD_FAILED = 'ANNOUNCE_FILTER_LOAD_FAILED'
export const CHANGE_FILTER_DISPLAY_STATE = 'CHANGE_FILTER_DISPLAY_STATE'

import {
    PAGE_KEY__PROJECTS_PAGE,
    PAGE_KEY__SPRINTS_PAGE,
    PAGE_KEY__ISSUES_PAGE
} from './ItemListKeyRegistry'
import {
    get_selected_project_ids,
    get_selected_sprint_ids,
    get_selected_issue_ids
} from './Page'

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

        const selected_project_ids = get_selected_project_ids(state, PAGE_KEY__PROJECTS_PAGE)
        const selected_sprint_ids = get_selected_sprint_ids(state, PAGE_KEY__SPRINTS_PAGE)
        const selected_issue_ids = get_selected_issue_ids(state, PAGE_KEY__ISSUES_PAGE)

	      const params = { filter: { term: term,
                                   selected_project_ids: selected_project_ids,
                                   selected_sprint_ids: selected_sprint_ids,
                                   selected_issue_ids: selected_issue_ids } }

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
