import { impfetch } from './lib.js'
import { ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT } from '../actions/ItemListKeyRegistry'
import { get } from 'lodash'
import {
    invalidateAllItems,
    invalidateItems,
    ensureItemsLoaded,
    getItem,
    announceItemsSaving,
    announceItemsSaved,
    announceItemSaveFailed,
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

export function is_annotated_visual_spec_document_invalidated(state, annotated_visual_spec_document_id) {
    return get(state, ["item", "annotated_visual_spec_document", "invalidated_item_ids"], []).indexOf(annotated_visual_spec_document_id) !== -1
}

export function deleteAnnotatedVisualSpecDocument(annotated_visual_spec_document_id, onDone) {
    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceItemsSaving(ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT, annotated_visual_spec_document_id))
	let data = { annotated_visual_spec_document_id: annotated_visual_spec_document_id }
	return impfetch( state, "imp/" + ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT + "/" + annotated_visual_spec_document_id + "/", dispatch,
			 {method: "DELETE",
			  credentials: 'same-origin',
			  data: data,
			  headers: {"Content-type": "application/json; charset=UTF-8"},
			  body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
                 dispatch(announceItemSaveFailed(ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceItemsSaved(ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT, [annotated_visual_spec_document_id]))
                 if ( onDone ) {
                     onDone()
                 }
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
             dispatch(announceItemSaveFailed(ENTITY_KEY__ANNOTATED_VISUAL_SPEC_DOCUMENT, error))
	 })
    }
}
