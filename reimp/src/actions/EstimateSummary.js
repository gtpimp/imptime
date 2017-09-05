import { impfetch, download } from './lib.js'
import indexOf from 'lodash/indexOf'
import keyBy from 'lodash/keyBy'
import includes from 'lodash/includes'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__ESTIMATE_SUMMARY } from '../actions/ItemListKeyRegistry'

export const ANNOUNCE_ESTIMATE_SUMMARY_LOADED = 'ANNOUNCE_ESTIMATE_SUMMARY_LOADED'
export const ANNOUNCE_ESTIMATE_SUMMARY_LOAD_FAILED = 'ANNOUNCE_ESTIMATE_SUMMARY_LOAD_FAILED'
export const ANNOUNCE_LOADING_ESTIMATE_SUMMARY = 'ANNOUNCE_LOADING_ESTIMATE_SUMMARY'
export const INVALIDATE_ESTIMATE_SUMMARY = 'INVALIDATE_ESTIMATE_SUMMARY'

export function invalidateEstimateSummary(sprint_id) {
    sprint_id = parseInt(sprint_id)
    return {
        type: INVALIDATE_ESTIMATE_SUMMARY,
	sprint_id_to_invalidate: sprint_id
    }
}

function announceLoadingEstimateSummary(sprint_id) {
    sprint_id = parseInt(sprint_id)
    return {
        type: ANNOUNCE_LOADING_ESTIMATE_SUMMARY,
	sprint_id_to_load: sprint_id
    }
}

function announceEstimateSummaryLoaded(payload) {
    const estimate_summary = payload.estimate_summary
    estimate_summary.received_at = Date.now()
    return {
        type: ANNOUNCE_ESTIMATE_SUMMARY_LOADED,
        estimate_summary: estimate_summary,
        sprint_id: estimate_summary.sprint_id
    }
}

function announceEstimateSummaryLoadFailed(error) {
    return {
        type: ANNOUNCE_ESTIMATE_SUMMARY_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

export function ensureEstimateSummaryLoaded(sprint_id) {
    sprint_id = parseInt(sprint_id)
    return (dispatch, getState) => {
        const state = getState()
        if ( isLoadingEstimateSummary(state, sprint_id) ) {
            return
        }
        if ( getEstimateSummary(state, sprint_id) === null ) {
            dispatch(fetchEstimateSummary(sprint_id))
        }
    }
}

function fetchEstimateSummary(sprint_id) {
    sprint_id = parseInt(sprint_id)
    return (dispatch, getState) => {
        const state = getState()
	dispatch(announceLoadingEstimateSummary(sprint_id))
	return impfetch(state, 'imp/estimate_summary/'+sprint_id+'/', dispatch)
            .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceEstimateSummaryLoadFailed(json.error))
                } else {
                    dispatch(announceEstimateSummaryLoaded(json.payload))
                }
	    }).catch(function (error) {
		dispatch(announceEstimateSummaryLoadFailed("Failed to load time summary: " + error))
	    })
    }
}


export function getEstimateSummary(state, sprint_id) {
    sprint_id = parseInt(sprint_id)
    return ((state.estimate_summary || {}).items_by_sprint_id || {})[sprint_id] || null
}

export function isLoadingEstimateSummary(state, sprint_id) {
    sprint_id = parseInt(sprint_id)
    const loading_ids = (state.estimate_summary || {}).loading_sprint_ids || []
    return includes(loading_ids, sprint_id)
}

export function download_sprint_comparative_estimates(sprint_id) {
    return (dispatch, getState) => {
        const state = getState()
        const url = 'imp/estimate_summary/'+sprint_id+'/download_comparative_summary/'
        return download(state, url)
    }
}    
