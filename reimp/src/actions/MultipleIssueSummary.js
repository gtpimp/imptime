import { impfetch } from './lib.js'
import { ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY } from '../actions/ItemListKeyRegistry'
import { map, compact, reduce, sortBy } from 'lodash'
import difference from 'lodash/difference'

import {
    invalidateAllItems,
    invalidateItems,
    ensureItemsLoaded,
    getItem,
    is_item_invalidated,
    getInvalidatedItemIds,
    getLoadingItemIds
} from '../actions/Item'

export function getSummaryKey(issue_ids) {
    return reduce(sortBy(issue_ids), function (key, x) { return key+"_"+x })
}

export function invalidateAllMultipleIssueSummaries() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY))
    }
}

export function invalidateMultipleIssueSummary(issue_ids) {
    return (dispatch, getState) => {
        const summary_key = getSummaryKey(issue_ids)
        dispatch(invalidateItems(ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY, [summary_key]))
    }
}

export function ensureMultipleIssueSummaryLoaded(issue_ids) {
    const summary_key = getSummaryKey(issue_ids)
    const additional_get_args = { issue_ids: issue_ids }
    return ensureItemsLoaded(ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY, [summary_key], additional_get_args)
}

export function getMultipleIssueSummary(state, issue_ids) {
    const summary_key = getSummaryKey(issue_ids)
    return getItem(state, ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY, summary_key)
}

export function isMultipleIssueSummaryInvalidated(state, issue_ids) {
    const summary_key = getSummaryKey(issue_ids)
    return is_item_invalidated(ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY, state, summary_key)
}

export function isMultipleIssueSummaryLoading(state, issue_ids) {
    const summary_key = getSummaryKey(issue_ids)
    return getLoadingItemIds(state, ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY, [summary_key])
}
