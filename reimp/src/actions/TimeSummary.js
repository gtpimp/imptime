import { impfetch } from './lib.js'
import includes from 'lodash/includes'

export const ANNOUNCE_TIME_SUMMARY_LOADED = 'ANNOUNCE_TIME_SUMMARY_LOADED'
export const ANNOUNCE_TIME_SUMMARY_LOAD_FAILED = 'ANNOUNCE_TIME_SUMMARY_LOAD_FAILED'
export const ANNOUNCE_LOADING_TIME_SUMMARY = 'ANNOUNCE_LOADING_TIME_SUMMARY'
export const INVALIDATE_TIME_SUMMARY = 'INVALIDATE_TIME_SUMMARY'

export function invalidateTimeSummary(sprint_id) {
    sprint_id = parseInt(sprint_id, 10)
    return {
        type: INVALIDATE_TIME_SUMMARY,
	      sprint_id_to_invalidate: sprint_id
    }
}

function announceLoadingTimeSummary(sprint_id) {
    sprint_id = parseInt(sprint_id, 10)
    return {
        type: ANNOUNCE_LOADING_TIME_SUMMARY,
	      sprint_id_to_load: sprint_id
    }
}

function announceTimeSummaryLoaded(payload) {
    const time_summary = payload.time_summary
    time_summary.received_at = Date.now()
    return {
        type: ANNOUNCE_TIME_SUMMARY_LOADED,
        time_summary: time_summary,
        sprint_id: time_summary.sprint_id
    }
}

function announceTimeSummaryLoadFailed(error) {
    return {
        type: ANNOUNCE_TIME_SUMMARY_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

export function ensureTimeSummaryLoaded(sprint_id) {
    sprint_id = parseInt(sprint_id, 10)
    return (dispatch, getState) => {
        const state = getState()
        if ( isLoadingTimeSummary(state, sprint_id) ) {
            return
        }
        if ( getTimeSummary(state, sprint_id) === null ) {
            dispatch(fetchTimeSummary(sprint_id))
        }
    }
}

function fetchTimeSummary(sprint_id) {
    sprint_id = parseInt(sprint_id, 10)
    return (dispatch, getState) => {
        const state = getState()
	      dispatch(announceLoadingTimeSummary(sprint_id))
	      return impfetch(state, 'imp/time_summary/'+sprint_id+'/', dispatch)
            .then(response => response.json())
	          .then(json => {
                if (json.status !== 'success') {
		                dispatch(announceTimeSummaryLoadFailed(json.error))
                } else {
                    dispatch(announceTimeSummaryLoaded(json.payload))
                }
	          }).catch(function (error) {
		            dispatch(announceTimeSummaryLoadFailed("Failed to load time summary: " + error))
	          })
    }
}


export function getTimeSummary(state, sprint_id) {
    sprint_id = parseInt(sprint_id, 10)
    return ((state.time_summary || {}).items_by_sprint_id || {})[sprint_id] || null
}

export function isLoadingTimeSummary(state, sprint_id) {
    sprint_id = parseInt(sprint_id, 10)
    const loading_ids = (state.time_summary || {}).loading_sprint_ids || []
    return includes(loading_ids, sprint_id)
}
