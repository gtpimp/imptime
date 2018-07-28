import { ENTITY_KEY__ISSUE_HISTORY } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
} from '../actions/Item'

export function invalidateAllIssueHistories() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__ISSUE_HISTORY))
    }
}

export function invalidateIssueHistories(issue_history_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__ISSUE_HISTORY,
                                 issue_history_ids_to_invalidate
        ))
    }
}

export function fetchIssueHistoriesIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__ISSUE_HISTORY, list_key))
    }
}

export function ensureIssueHistoriesLoaded(issue_history_ids) {
    return ensureItemsLoaded(ENTITY_KEY__ISSUE_HISTORY, issue_history_ids)
}

export function getIssueHistory(state, issue_history_id) {
    return getItem(state, ENTITY_KEY__ISSUE_HISTORY, issue_history_id)
}

export function getIssueHistories(state, issue_history_ids) {
    return getItems(state, ENTITY_KEY__ISSUE_HISTORY, issue_history_ids)
}

