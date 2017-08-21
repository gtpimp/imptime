import { impfetch } from './lib.js'
import indexOf from 'lodash/indexOf'
import keyBy from 'lodash/keyBy'
import includes from 'lodash/includes'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__COST_SUMMARY } from '../actions/ItemListKeyRegistry'

export const ANNOUNCE_COST_SUMMARY_LOADED = 'ANNOUNCE_COST_SUMMARY_LOADED'
export const ANNOUNCE_COST_SUMMARY_LOAD_FAILED = 'ANNOUNCE_COST_SUMMARY_LOAD_FAILED'
export const ANNOUNCE_LOADING_COST_SUMMARY = 'ANNOUNCE_LOADING_COST_SUMMARY'
export const INVALIDATE_COST_SUMMARY = 'INVALIDATE_COST_SUMMARY'

export function invalidateCostSummary(sprint_id) {
    sprint_id = parseInt(sprint_id)
    return {
        type: INVALIDATE_COST_SUMMARY,
	      sprint_id_to_invalidate: sprint_id
    }
}

function announceLoadingCostSummary(sprint_id) {
    sprint_id = parseInt(sprint_id)
    return {
        type: ANNOUNCE_LOADING_COST_SUMMARY,
	      sprint_id_to_load: sprint_id
    }
}

function announceCostSummaryLoaded(payload) {
    const cost_summary = payload.cost_summary
    return {
        type: ANNOUNCE_COST_SUMMARY_LOADED,
        cost_summary: cost_summary,
        sprint_id: cost_summary.sprint_id,
	      received_at: Date.now()
    }
}

function announceCostSummaryLoadFailed(error) {
    return {
        type: ANNOUNCE_COST_SUMMARY_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

export function ensureCostSummaryLoaded(sprint_id) {
    sprint_id = parseInt(sprint_id)
    return (dispatch, getState) => {
        const state = getState()
        if ( isLoadingCostSummary(state, sprint_id) ) {
            return
        }
        if ( getCostSummary(state, sprint_id) === null ) {
            dispatch(fetchCostSummary(dispatch, state, sprint_id))
        }
    }
}

function fetchCostSummary(dispatch, state, sprint_id) {
    sprint_id = parseInt(sprint_id)
    return (dispatch, getState) => {
        const state = getState()
	dispatch(announceLoadingCostSummary(sprint_id))
	return impfetch(state, 'imp/cost_summary/'+sprint_id+'/', dispatch)
            .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceCostSummaryLoadFailed(json.error))
                } else {
                    dispatch(announceCostSummaryLoaded(json.payload))
		    /* dispatch(ensureCostSummaryLoaded(json.payload.cost_summary.sprint_id))*/
                }
	    }).catch(function (error) {
		dispatch(announceCostSummaryLoadFailed("Failed to load cost summary: " + error))
	    })
    }
}


export function getCostSummary(state, sprint_id) {
    sprint_id = parseInt(sprint_id)
    return ((state.cost_summary || {}).items_by_sprint_id || {})[sprint_id] || null
}

export function isLoadingCostSummary(state, sprint_id) {
    sprint_id = parseInt(sprint_id)
    const loading_ids = (state.cost_summary || {}).loading_sprint_ids || []
    const test = includes(loading_ids, sprint_id)
    return includes(loading_ids, sprint_id)
}
