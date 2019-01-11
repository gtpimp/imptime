import { ENTITY_KEY__SPRINT_DEADLINE } from '../actions/ItemListKeyRegistry'

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
} from '../actions/Item'

export function invalidateAllSprintDeadlines() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__SPRINT_DEADLINE))
    }
}

export function invalidateSprintDeadlines(sprint_deadline_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__SPRINT_DEADLINE,
                                 sprint_deadline_ids_to_invalidate
        ))
    }
}

export function updateSprintDeadline(sprint_deadline_ids, deadline, on_done) {
    return updateItem(ENTITY_KEY__SPRINT_DEADLINE, sprint_deadline_ids, "deadline", deadline, on_done)
}

export function fetchSprintDeadlinesIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__SPRINT_DEADLINE, list_key))
    }
}

export function ensureSprintDeadlinesLoaded(sprint_deadline_ids) {
    return ensureItemsLoaded(ENTITY_KEY__SPRINT_DEADLINE, sprint_deadline_ids)
}

export function getSprintDeadline(state, sprint_deadline_id) {
    return getItem(state, ENTITY_KEY__SPRINT_DEADLINE, sprint_deadline_id)
}

export function getSprintDeadlines(state, sprint_deadline_ids) {
    return getItems(state, ENTITY_KEY__SPRINT_DEADLINE, sprint_deadline_ids) || {}
}

export function getSprintDeadlinesById(state, sprint_deadline_ids) {
    return getItemsById(state, ENTITY_KEY__SPRINT_DEADLINE, sprint_deadline_ids)
}

export function createSprintDeadline(deadline) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__SPRINT_DEADLINE, deadline))
        dispatch(saveCandidateItem(ENTITY_KEY__SPRINT_DEADLINE))
    }
}

export function deleteSprintDeadline(sprint_deadline_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__SPRINT_DEADLINE, [sprint_deadline_id]))
    }
}
