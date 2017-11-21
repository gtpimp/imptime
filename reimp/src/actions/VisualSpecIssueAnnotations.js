import { impfetch } from './lib.js'
import { compact, map, keys, keyBy, includes, difference, indexOf, identity } from 'lodash'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__VISUAL_SPEC_ISSUE_ANNOTATION } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsPromise,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    updateItem,
    startCandidateItem,
    saveCandidateItem,
    deleteItem,
    announceItemSaveFailed,
    announceItemsSaved,
    announceItemsSaving,
    UPDATE_ENTIRE_ITEM_FIELD_NAME
} from '../actions/Item'

export function invalidateAllVisualSpecIssueAnnotations() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__VISUAL_SPEC_ISSUE_ANNOTATION))
    }
}

export function invalidateVisualSpecIssueAnnotations(visual_spec_issue_annotation_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__VISUAL_SPEC_ISSUE_ANNOTATION,
                                 visual_spec_issue_annotation_ids_to_invalidate
        ))
    }
}

export function updateVisualSpecIssueAnnotation(visual_spec_document_id, issue_id,
                                                visual_spec_issue_annotation_ids, params) {
    const data = Object.assign({},
                               {visual_spec_document_id: visual_spec_document_id,
                                issue_id: issue_id},
                               params)
    return updateItem(ENTITY_KEY__VISUAL_SPEC_ISSUE_ANNOTATION, visual_spec_issue_annotation_ids,
                      UPDATE_ENTIRE_ITEM_FIELD_NAME, data)
}

export function fetchVisualSpecIssueAnnotationsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__VISUAL_SPEC_ISSUE_ANNOTATION, list_key))
    }
}

export function ensureVisualSpecIssueAnnotationsLoaded(visual_spec_issue_annotation_ids) {
    return ensureItemsLoaded(ENTITY_KEY__VISUAL_SPEC_ISSUE_ANNOTATION, visual_spec_issue_annotation_ids)
}

export function getVisualSpecIssueAnnotation(state, visual_spec_issue_annotation_id) {
    return getItem(state, ENTITY_KEY__VISUAL_SPEC_ISSUE_ANNOTATION, visual_spec_issue_annotation_id)
}

export function getVisualSpecIssueAnnotations(state, visual_spec_issue_annotation_ids) {
    return getItems(state, ENTITY_KEY__VISUAL_SPEC_ISSUE_ANNOTATION, visual_spec_issue_annotation_ids)
}

export function createVisualSpecIssueAnnotation(visual_spec_document_id, issue_id, params) {
    return (dispatch, getState) => {
        const data = Object.assign({},
                                   {visual_spec_document_id: visual_spec_document_id,
                                    issue_id: issue_id},
                                   params)
        dispatch(startCandidateItem(ENTITY_KEY__VISUAL_SPEC_ISSUE_ANNOTATION, data))
        dispatch(saveCandidateItem(ENTITY_KEY__VISUAL_SPEC_ISSUE_ANNOTATION))
    }
}

export function deleteVisualSpecIssueAnnotation(visual_spec_issue_annotation_id) {
    return (dispatch, getState) => {
        dispatch(deleteItem(ENTITY_KEY__VISUAL_SPEC_ISSUE_ANNOTATION, visual_spec_issue_annotation_id))
    }
}

export function is_visual_spec_issue_annotation_invalidated(state, visual_spec_issue_annotation_id) {
    return ((((state.item || {}).visual_spec_issue_annotation || {}).invalidated_item_ids) || []).indexOf(visual_spec_issue_annotation_id) !== -1
}
