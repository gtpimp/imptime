export const UPDATE_GLOBAL_FILTER = 'UPDATE_GLOBAL_FILTER'

import { impfetch } from '../actions/lib'
export const INIT_FILTER = 'INIT_FILTER'
export const CLEAR_FILTER = 'CLEAR_FILTER'
export const ANNOUNCE_FILTER_LOADING = 'ANNOUNCE_FILTER_LOADING'
export const ANNOUNCE_FILTER_LOADED = 'ANNOUNCE_FILTER_LOADED'
export const ANNOUNCE_FILTER_LOAD_FAILED = 'ANNOUNCE_FILTER_LOAD_FAILED'

export function initFilter(filter_key, url) {
    return {
        type: INIT_FILTER,
        filter_key: filter_key,
        url: url
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

function announceFilterLoaded(filter_key, results) {
    return {
        type: ANNOUNCE_FILTER_LOADED,
        filter_key: filter_key,
        results: results
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
        const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
	dispatch(announceFilterLoading(filter_key, term))

	const params = { filter: { term: term } }
	
        return impfetch(API_BASE_URL + filter.url, dispatch, {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceFilterLoadFailed(filter_key, json.error))
                } else {
		    dispatch(announceFilterLoaded(filter_key, json.payload))
                }
	    }).catch(function (error) {
		dispatch(announceFilterLoadFailed(filter_key, "Failed to load users: " + (error || {}).message))
	    })
    }
}

export function getFilter(state, filter_key) {
    return ((state.filter || {})[filter_key] || {}) || null
}
