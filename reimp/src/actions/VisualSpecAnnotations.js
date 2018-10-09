import { ENTITY_KEY__VISUAL_SPEC_ANNOTATION } from '../actions/ItemListKeyRegistry'
import { get } from 'lodash'
import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    updateItem,
    startCandidateItem,
    saveCandidateItem,
    deleteItems,
    UPDATE_ENTIRE_ITEM_FIELD_NAME
} from '../actions/Item'

export function invalidateAllVisualSpecAnnotations() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__VISUAL_SPEC_ANNOTATION))
    }
}

export function invalidateVisualSpecAnnotations(visual_spec_annotation_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__VISUAL_SPEC_ANNOTATION,
                                 visual_spec_annotation_ids_to_invalidate
        ))
    }
}

export function updateVisualSpecAnnotation(annotated_visual_spec_document_id,
                                           visual_spec_annotation_ids, params) {
    const data = Object.assign({},
                               {annotated_visual_spec_document_id: annotated_visual_spec_document_id},
                               params)
    return updateItem(ENTITY_KEY__VISUAL_SPEC_ANNOTATION, visual_spec_annotation_ids,
                      UPDATE_ENTIRE_ITEM_FIELD_NAME, data)
}

export function fetchVisualSpecAnnotationsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__VISUAL_SPEC_ANNOTATION, list_key))
    }
}

export function ensureVisualSpecAnnotationsLoaded(visual_spec_annotation_ids) {
    return ensureItemsLoaded(ENTITY_KEY__VISUAL_SPEC_ANNOTATION, visual_spec_annotation_ids)
}

export function getVisualSpecAnnotation(state, visual_spec_annotation_id) {
    return getItem(state, ENTITY_KEY__VISUAL_SPEC_ANNOTATION, visual_spec_annotation_id)
}

export function getVisualSpecAnnotations(state, visual_spec_annotation_ids) {
    return getItems(state, ENTITY_KEY__VISUAL_SPEC_ANNOTATION, visual_spec_annotation_ids)
}

export function createVisualSpecAnnotation(annotated_visual_spec_document_id, params) {
    return (dispatch, getState) => {
        const data = Object.assign({},
                                   {annotated_visual_spec_document_id: annotated_visual_spec_document_id},
                                   params)
        dispatch(startCandidateItem(ENTITY_KEY__VISUAL_SPEC_ANNOTATION, data))
        dispatch(saveCandidateItem(ENTITY_KEY__VISUAL_SPEC_ANNOTATION))
    }
}

export function deleteVisualSpecAnnotation(visual_spec_annotation_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__VISUAL_SPEC_ANNOTATION, [visual_spec_annotation_id]))
    }
}

export function is_visual_spec_annotation_invalidated(state, visual_spec_annotation_id) {
    return get(state, ["item", "visual_spec_annotation", "invalidated_item_ids"], []).indexOf(visual_spec_annotation_id) !== -1
}
