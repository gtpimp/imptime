import {
    ENTITY_KEY__VISUAL_SPEC_ANNOTATION,
    ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT
} from '../actions/ItemListKeyRegistry'
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
    UPDATE_ENTIRE_ITEM_FIELD_NAME,
    PERFORM_CUSTOM_MANIPULATION
} from '../actions/Item'
import {
    update_visual_spec_annotation_within_annotated_vsd,
    delete_visual_spec_annotation_within_annotated_vsd
} from '../reducers/annotated_visual_spec_document'

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

    return (dispatch, getState) => {
        const data = Object.assign({},
                                   {annotated_visual_spec_document_id: annotated_visual_spec_document_id},
                                   params)

        dispatch({
            type: PERFORM_CUSTOM_MANIPULATION,
            func: update_visual_spec_annotation_within_annotated_vsd,
            entity_key: ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT,
            annotated_visual_spec_document_id,
            annotation_ids: visual_spec_annotation_ids,
            params: params})
            
        dispatch(updateItem(ENTITY_KEY__VISUAL_SPEC_ANNOTATION, visual_spec_annotation_ids,
                            UPDATE_ENTIRE_ITEM_FIELD_NAME, data))
    }
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

export function deleteVisualSpecAnnotation(annotated_visual_spec_document_id, visual_spec_annotation_id) {
    return (dispatch, getState) => {
        dispatch({
            type: PERFORM_CUSTOM_MANIPULATION,
            func: delete_visual_spec_annotation_within_annotated_vsd,
            entity_key: ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT,
            annotated_visual_spec_document_id,
            annotation_ids: [visual_spec_annotation_id]})
        
        dispatch(deleteItems(ENTITY_KEY__VISUAL_SPEC_ANNOTATION, [visual_spec_annotation_id]))
    }
}

export function is_visual_spec_annotation_invalidated(state, visual_spec_annotation_id) {
    return get(state, ["item", "visual_spec_annotation", "invalidated_item_ids"], []).indexOf(visual_spec_annotation_id) !== -1
}
