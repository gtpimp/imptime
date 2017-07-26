import { impfetch } from './lib.js'
import indexOf from 'lodash/indexOf'
import keyBy from 'lodash/keyBy'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__COST_SUMMARY } from '../actions/ItemListKeyRegistry'

export const ANNOUNCE_COST_SUMMARY_LOADED = 'ANNOUNCE_COST_SUMMARY_LOADED'
export const ANNOUNCE_COST_SUMMARY_LOAD_FAILED = 'ANNOUNCE_COST_SUMMARY_LOAD_FAILED'
export const ANNOUNCE_LOADING_COST_SUMMARY = 'ANNOUNCE_LOADING_COST_SUMMARY'
export const INVALIDATE_COST_SUMMARY = 'INVALIDATE_COST_SUMMARY'

export function invalidateCostSummary(sprint_id) {
    return {
        type: INVALIDATE_COST_SUMMARY,
	      sprint_id_to_invalidate: sprint_id
    }
}

function announceLoadingCostSummary(sprint_id) {
    return {
        type: ANNOUNCE_LOADING_COST_SUMMARY,
	      sprint_id_to_load: sprint_id
    }
}

function announceCostSummaryLoaded(payload) {
    return {
        type: ANNOUNCE_COST_SUMMARY_LOADED,
        item_by_id: keyBy(payload.cost_summary, 'id'),
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
    return (dispatch, getState) => {
        const state = getState()

        const cost_summary_to_load = getMissingItemIds(state, sprint_id, 'cost_summary')
        if ( cost_summary_to_load.length > 0 ) {
            fetchCostSummaryPromise(dispatch, state, cost_summary_to_load)
        }
    }
}

export function getCostSummary(state, sprint_id) {
    return ((state.cost_summary || {}).items_by_id || {})[sprint_id] || null
}
