import { ENTITY_KEY__SPRINT_COST_SUMMARY } from './ItemListKeyRegistry'

import {
    invalidateItems,
    ensureItemsLoaded,
    isLoadingItems,
    getItem
} from './Item'

export function invalidateCostSummary(sprint_id) {
    return invalidateItems(ENTITY_KEY__SPRINT_COST_SUMMARY, [sprint_id])
}

export function ensureCostSummaryLoaded(sprint_id) {
    return ensureItemsLoaded(ENTITY_KEY__SPRINT_COST_SUMMARY, [sprint_id])
}

export function getCostSummary(state, sprint_id) {
    return getItem(state, ENTITY_KEY__SPRINT_COST_SUMMARY, sprint_id)
}

export function isLoadingCostSummary(state, sprint_id) {
    return isLoadingItems(state, ENTITY_KEY__SPRINT_COST_SUMMARY, [sprint_id])
}
