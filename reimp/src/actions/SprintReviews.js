import { ENTITY_KEY__SPRINT_REVIEW } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    getItemsById,
    updateItem,
    startCandidateItem,
    saveCandidateItem,
    deleteItems,
    isLoadingItems,
} from '../actions/Item'

export function invalidateAllSprintReviews() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__SPRINT_REVIEW))
    }
}

export function invalidateSprintReviews(sprint_review_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__SPRINT_REVIEW,
                                 sprint_review_ids_to_invalidate
        ))
    }
}

export function updateSprintReview(sprint_review_ids, review, on_done) {
    return updateItem(ENTITY_KEY__SPRINT_REVIEW, sprint_review_ids, "review", review, on_done)
}

export function fetchSprintReviewsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__SPRINT_REVIEW, list_key))
    }
}

export function ensureSprintReviewsLoaded(sprint_review_ids) {
    return ensureItemsLoaded(ENTITY_KEY__SPRINT_REVIEW, sprint_review_ids)
}

export function getSprintReview(state, sprint_review_id) {
    return getItem(state, ENTITY_KEY__SPRINT_REVIEW, sprint_review_id)
}

export function getSprintReviews(state, sprint_review_ids) {
    return getItems(state, ENTITY_KEY__SPRINT_REVIEW, sprint_review_ids)
}

export function getSprintReviewsById(state, sprint_review_ids) {
    return getItemsById(state, ENTITY_KEY__SPRINT_REVIEW, sprint_review_ids)
}

export function createSprintReview(review) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__SPRINT_REVIEW, review))
        dispatch(saveCandidateItem(ENTITY_KEY__SPRINT_REVIEW))
    }
}

export function deleteSprintReview(sprint_review_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__SPRINT_REVIEW, [sprint_review_id]))
    }
}

export function isLoadingSprintReviews(state, item_ids) {
    return isLoadingItems(state, ENTITY_KEY__SPRINT_REVIEW, item_ids)
}
