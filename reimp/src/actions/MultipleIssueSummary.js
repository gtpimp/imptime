import { hash_flat_object, download } from './lib.js'
import { ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    ensureItemsLoaded,
    isLoadingItems,
    getItem,
    is_item_invalidated,
    getLoadingItemIds
} from '../actions/Item'

export function getSummaryKey(filter) {
    return hash_flat_object(filter)
}

export function invalidateAllMultipleIssueSummaries() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY))
    }
}

export function invalidateMultipleIssueSummary(filter) {
    return (dispatch, getState) => {
        const summary_key = getSummaryKey(filter)
        dispatch(invalidateItems(ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY, [summary_key]))
    }
}

export function ensureMultipleIssueSummaryLoaded(filter) {
    const summary_key = getSummaryKey(filter)
    const additional_get_args = {filter: filter}
    return ensureItemsLoaded(ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY, [summary_key], additional_get_args)
}

export function isLoadingMultipleIssueSummary(state, filter) {
    const summary_key = getSummaryKey(filter)
    return isLoadingItems(state, ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY, [summary_key])
}

export function getMultipleIssueSummary(state, filter) {
    const summary_key = getSummaryKey(filter)
    return getItem(state, ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY, summary_key)
}

export function isMultipleIssueSummaryInvalidated(state, filter) {
    const summary_key = getSummaryKey(filter)
    return is_item_invalidated(ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY, state, summary_key)
}

export function isMultipleIssueSummaryLoading(state, filter) {
    const summary_key = getSummaryKey(filter)
    return getLoadingItemIds(state, ENTITY_KEY__MULTIPLE_ISSUE_SUMMARY, [summary_key])
}

export function downloadActualsByIssue(filter, project_id) {
    return (dispatch, getState) => {
        const state = getState()
        const url = 'imp/multiple_issue_summary/'+project_id+'/download_summary/'
        return download(state, url, null, filter)
    }    
}
