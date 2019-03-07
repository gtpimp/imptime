import { ENTITY_KEY__SPRINT_COST_SUMMARY } from './ItemListKeyRegistry'
import { download } from './lib'

import {
    invalidateItems,
    ensureItemsLoaded,
    fetchItemsIfNeeded,
    isLoadingItems,
    getItem,
    getItems,
    getItemsById
} from './Item'

export function invalidateCostSummary(sprint_id) {
    return invalidateItems(ENTITY_KEY__SPRINT_COST_SUMMARY, [sprint_id])
}

export function ensureCostSummaryLoaded(sprint_id) {
    return ensureItemsLoaded(ENTITY_KEY__SPRINT_COST_SUMMARY, [sprint_id])
}

export function ensureCostSummariesLoaded(sprint_ids) {
    return ensureItemsLoaded(ENTITY_KEY__SPRINT_COST_SUMMARY, sprint_ids)
}

export function getCostSummary(state, sprint_id) {
    return getItem(state, ENTITY_KEY__SPRINT_COST_SUMMARY, sprint_id)
}

export function getCostSummaries(state, sprint_ids, real_only) {
    return getItems(state, ENTITY_KEY__SPRINT_COST_SUMMARY, sprint_ids, real_only)
}

export function isLoadingCostSummary(state, sprint_id) {
    return isLoadingItems(state, ENTITY_KEY__SPRINT_COST_SUMMARY, [sprint_id])
}

export function fetchCostSummariesIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__SPRINT_COST_SUMMARY, list_key))
    }
}

export function getCostSummariesById(state, cost_summary_ids) {
    return getItemsById(state, ENTITY_KEY__SPRINT_COST_SUMMARY, cost_summary_ids)
}

export function downloadSprintCostSummary(sprint_id) {
    return (dispatch, getState) => {
        const state = getState()
        const url = `imp/sprint_cost_summary/download/`
        const params = { sprint_id: sprint_id,
                         format: 'csv' }
        return download(state, url, params)
    }
}
 
export function downloadProjectCostSummary(project_id) {
    return (dispatch, getState) => {
        const state = getState()
        const url = `imp/sprint_cost_summary/download/`
        const params = { project_id: project_id,
                         format: 'csv' }
        return download(state, url, params)
    }
}

