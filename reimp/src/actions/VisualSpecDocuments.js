import { map, indexOf } from 'lodash'
import move from 'lodash-move'
import { setIssueStoreValue } from './Issues'
import { ENTITY_KEY__VISUAL_SPEC_DOCUMENT } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    updateItem
} from '../actions/Item'

export const UPLOAD_RELATIVE_URL = 'imp/visual_spec_document/'

export function invalidateAllVisualSpecDocuments() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__VISUAL_SPEC_DOCUMENT))
    }
}

export function invalidateVisualSpecDocuments(visual_spec_document_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__VISUAL_SPEC_DOCUMENT,
                                 visual_spec_document_ids_to_invalidate
        ))
    }
}

export function updateVisualSpecDocument(visual_spec_document_ids, field_name, new_value, on_done) {
    return updateItem(ENTITY_KEY__VISUAL_SPEC_DOCUMENT, visual_spec_document_ids, field_name, new_value, on_done)
}

export function fetchVisualSpecDocumentsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__VISUAL_SPEC_DOCUMENT, list_key))
    }
}

export function ensureVisualSpecDocumentsLoaded(visual_spec_document_ids) {
    return ensureItemsLoaded(ENTITY_KEY__VISUAL_SPEC_DOCUMENT, visual_spec_document_ids)
}

export function getVisualSpecDocument(state, visual_spec_document_id) {
    return getItem(state, ENTITY_KEY__VISUAL_SPEC_DOCUMENT, visual_spec_document_id)
}

export function getVisualSpecDocuments(state, visual_spec_document_ids) {
    return getItems(state, ENTITY_KEY__VISUAL_SPEC_DOCUMENT, visual_spec_document_ids)
}

export function reorderVisualSpecDocument(visual_spec_document_ids, moving_visual_spec_document_id,
                                          visual_spec_document_id_after, on_done, extra_post_data) {
    return (dispatch, getState) => {
        const state = getState()
        const item_id_to_move = moving_visual_spec_document_id
        const item_id_to_move_after = visual_spec_document_id_after
        const item_ids = map(visual_spec_document_ids, function(id) { return "" + id })

        const index_of_item_id_to_move = indexOf(item_ids, item_id_to_move)
        let index_of_item_id_to_after = indexOf(item_ids, item_id_to_move_after)

        if ( index_of_item_id_to_move > index_of_item_id_to_after ) {
            index_of_item_id_to_after += 1
        }
        const reordered_item_ids = move(item_ids, index_of_item_id_to_move, index_of_item_id_to_after)

        const vsd = getVisualSpecDocument(state, moving_visual_spec_document_id)
        if ( vsd.id ) {
            dispatch(setIssueStoreValue([vsd.issue_id], 'visual_spec_document_ids', reordered_item_ids))
        }
        dispatch(updateItem(ENTITY_KEY__VISUAL_SPEC_DOCUMENT, [moving_visual_spec_document_id],
                            "visual_spec_document_id_after", visual_spec_document_id_after, on_done,
                            extra_post_data))
    }
}

