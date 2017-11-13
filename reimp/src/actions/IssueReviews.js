import { impfetch } from './lib.js'
import { setDisplayMode, getDisplayMode } from  './ItemList'
import { ENTITY_KEY__ISSUE_REVIEW } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    getItemsById
} from '../actions/Item'

export function getIssueReviewIdsFromSprintIds(issue_review_ids) {
    return issue_review_ids
}

export function invalidateAllIssueReviews() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__ISSUE_REVIEW))
    }
}

export function invalidateIssueReviews(issue_review_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__ISSUE_REVIEW,
                                 issue_review_ids_to_invalidate
        ))
    }
}

export function fetchIssueReviewsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__ISSUE_REVIEW, list_key))
    }
}

export function ensureIssueReviewsLoaded(issue_review_ids) {
    return ensureItemsLoaded(ENTITY_KEY__ISSUE_REVIEW, issue_review_ids)
}

export function getIssueReview(state, issue_review_id) {
    return getItem(state, ENTITY_KEY__ISSUE_REVIEW, issue_review_id)
}

export function getIssueReviews(state, issue_review_ids) {
    return getItems(state, ENTITY_KEY__ISSUE_REVIEW, issue_review_ids)
}

export function getIssueReviewsById(state, issue_review_ids) {
    return getItemsById(state, ENTITY_KEY__ISSUE_REVIEW, issue_review_ids)
}
