import { ENTITY_KEY__TESTABLE } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    getItemsById,
    updateItem,
    is_item_invalidated,
    deleteItems,
} from '../actions/Item'

export function invalidateAllTestables() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__TESTABLE))
    }
}

export function invalidateTestables(testable_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__TESTABLE,
                                 testable_ids_to_invalidate
        ))
    }
}

export function updateTestableName(testable_ids, name, on_done) {
    return updateItem(ENTITY_KEY__TESTABLE, testable_ids, "name", name, on_done)
}

export function fetchTestablesIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__TESTABLE, list_key))
    }
}

export function ensureTestablesLoaded(testable_ids) {
    return ensureItemsLoaded(ENTITY_KEY__TESTABLE, testable_ids)
}

export function getTestable(state, testable_id) {
    return getItem(state, ENTITY_KEY__TESTABLE, testable_id)
}

export function getTestables(state, testable_ids) {
    return getItems(state, ENTITY_KEY__TESTABLE, testable_ids) || {}
}

export function getTestablesById(state, testable_ids) {
    return getItemsById(state, ENTITY_KEY__TESTABLE, testable_ids)
}

// Create is specific to issue of features, look in those actions for this fuction

export function deleteTestable(testable_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__TESTABLE, [testable_id]))
    }
}

export function is_testable_invalidated(state, testable_id) {
    return is_item_invalidated(ENTITY_KEY__TESTABLE, state, testable_id)
}
