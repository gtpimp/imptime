import { ENTITY_KEY__TESTABLE_LINE } from '../actions/ItemListKeyRegistry'

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
    updateCandidateDetails,
    is_item_invalidated,
    saveCandidateItem,
    deleteItems,
} from '../actions/Item'

export function invalidateAllTestableLines() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__TESTABLE_LINE))
    }
}

export function invalidateTestableLines(testable_line_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__TESTABLE_LINE,
                                 testable_line_ids_to_invalidate
        ))
    }
}

export function updateTestableLines(testable_line_ids, instruction, on_done) {
    return updateItem(ENTITY_KEY__TESTABLE_LINE, testable_line_ids, "instruction", instruction, on_done)
}

export function fetchTestableLinesIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__TESTABLE_LINE, list_key))
    }
}

export function ensureTestableLinesLoaded(testable_line_ids) {
    return ensureItemsLoaded(ENTITY_KEY__TESTABLE_LINE, testable_line_ids)
}

export function getTestableLine(state, testable_line_id) {
    return getItem(state, ENTITY_KEY__TESTABLE_LINE, testable_line_id)
}

export function getTestableLines(state, testable_line_ids) {
    return getItems(state, ENTITY_KEY__TESTABLE_LINE, testable_line_ids) || {}
}

export function getTestableLinesById(state, testable_line_ids) {
    return getItemsById(state, ENTITY_KEY__TESTABLE_LINE, testable_line_ids)
}

export function createTestableLine(testable_id, instruction) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__TESTABLE_LINE, {instruction:instruction,
                                                                testable_id: testable_id}))
        dispatch(saveCandidateItem(ENTITY_KEY__TESTABLE_LINE))
    }
}

export function deleteTestableLine(testable_line_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__TESTABLE_LINE, [testable_line_id]))
    }
}

export function is_testable_line_invalidated(state, testable_line_id) {
    return is_item_invalidated(ENTITY_KEY__TESTABLE_LINE, state, testable_line_id)
}
