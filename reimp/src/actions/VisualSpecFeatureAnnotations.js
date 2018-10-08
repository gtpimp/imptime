import { ENTITY_KEY__VISUAL_SPEC_FEATURE_ANNOTATION } from '../actions/ItemListKeyRegistry'

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

export function invalidateAllVisualSpecFeatureAnnotations() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__VISUAL_SPEC_FEATURE_ANNOTATION))
    }
}

export function invalidateVisualSpecFeatureAnnotations(visual_spec_feature_annotation_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__VISUAL_SPEC_FEATURE_ANNOTATION,
                                 visual_spec_feature_annotation_ids_to_invalidate
        ))
    }
}

export function updateVisualSpecFeatureAnnotation(visual_spec_document_id, feature_id,
                                                visual_spec_feature_annotation_ids, params) {
    const data = Object.assign({},
                               {visual_spec_document_id: visual_spec_document_id,
                                feature_id: feature_id},
                               params)
    return updateItem(ENTITY_KEY__VISUAL_SPEC_FEATURE_ANNOTATION, visual_spec_feature_annotation_ids,
                      UPDATE_ENTIRE_ITEM_FIELD_NAME, data)
}

export function fetchVisualSpecFeatureAnnotationsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__VISUAL_SPEC_FEATURE_ANNOTATION, list_key))
    }
}

export function ensureVisualSpecFeatureAnnotationsLoaded(visual_spec_feature_annotation_ids) {
    return ensureItemsLoaded(ENTITY_KEY__VISUAL_SPEC_FEATURE_ANNOTATION, visual_spec_feature_annotation_ids)
}

export function getVisualSpecFeatureAnnotation(state, visual_spec_feature_annotation_id) {
    return getItem(state, ENTITY_KEY__VISUAL_SPEC_FEATURE_ANNOTATION, visual_spec_feature_annotation_id)
}

export function getVisualSpecFeatureAnnotations(state, visual_spec_feature_annotation_ids) {
    return getItems(state, ENTITY_KEY__VISUAL_SPEC_FEATURE_ANNOTATION, visual_spec_feature_annotation_ids)
}

export function createVisualSpecFeatureAnnotation(visual_spec_document_id, feature_id, params) {
    return (dispatch, getState) => {
        const data = Object.assign({},
                                   {visual_spec_document_id: visual_spec_document_id,
                                    feature_id: feature_id},
                                   params)
        dispatch(startCandidateItem(ENTITY_KEY__VISUAL_SPEC_FEATURE_ANNOTATION, data))
        dispatch(saveCandidateItem(ENTITY_KEY__VISUAL_SPEC_FEATURE_ANNOTATION))
    }
}

export function deleteVisualSpecFeatureAnnotation(visual_spec_feature_annotation_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__VISUAL_SPEC_FEATURE_ANNOTATION, [visual_spec_feature_annotation_id]))
    }
}

export function is_visual_spec_feature_annotation_invalidated(state, visual_spec_feature_annotation_id) {
    return ((((state.item || {}).visual_spec_feature_annotation || {}).invalidated_item_ids) || []).indexOf(visual_spec_feature_annotation_id) !== -1
}
