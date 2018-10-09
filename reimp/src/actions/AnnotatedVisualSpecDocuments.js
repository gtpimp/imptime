import { ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    ensureItemsLoaded,
    getItem
} from '../actions/Item'

export const UPLOAD_RELATIVE_URL = 'imp/visual_spec_document/'

export function ensureAnnotatedVisualSpecDocumentsLoaded(annotated_visual_spec_document_ids) {
    return ensureItemsLoaded(ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT, annotated_visual_spec_document_ids)
}

export function invalidateAllAnnotatedVisualSpecDocuments() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT))
    }
}

export function invalidateAnnotatedVisualSpecDocuments(annotated_visual_spec_document_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT,
                                 annotated_visual_spec_document_ids_to_invalidate
        ))
    }
}

export function getAnnotatedVisualSpecDocument(state, annotated_visual_spec_document_id) {
    return getItem(state, ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT, annotated_visual_spec_document_id)
}

