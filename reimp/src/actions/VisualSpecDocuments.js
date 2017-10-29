import { impfetch } from './lib.js'
import { compact, map, keys, keyBy, includes, difference, indexOf, identity } from 'lodash'
import move from 'lodash-move'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { invalidateIssues } from './Issues'
import { ENTITY_KEY__VISUAL_SPEC_DOCUMENT } from '../actions/ItemListKeyRegistry'

export const ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOADED = 'ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOADED'
export const ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOAD_FAILED = 'ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOAD_FAILED'
export const ANNOUNCE_LOADING_VISUAL_SPEC_DOCUMENTS = 'ANNOUNCE_LOADING_VISUAL_SPEC_DOCUMENTS'
export const INVALIDATE_VISUAL_SPEC_DOCUMENTS = 'INVALIDATE_VISUAL_SPEC_DOCUMENTS'
export const INVALIDATE_ALL_VISUAL_SPEC_DOCUMENTS = 'INVALIDATE_ALL_VISUAL_SPEC_DOCUMENTS'
export const ANNOUNCE_VISUAL_SPEC_DOCUMENTS_SAVED = 'ANNOUNCE_VISUAL_SPEC_DOCUMENTS_SAVED'
export const ANNOUNCE_VISUAL_SPEC_DOCUMENTS_SAVING = 'ANNOUNCE_VISUAL_SPEC_DOCUMENTS_SAVING'
export const ANNOUNCE_VISUAL_SPEC_DOCUMENT_SAVE_FAILED = 'ANNOUNCE_VISUAL_SPEC_DOCUMENT_SAVE_FAILED'

export function invalidateAllVisualSpecDocuments() {
    return {
        type: INVALIDATE_ALL_VISUAL_SPEC_DOCUMENTS
    }
}

export function invalidateVisualSpecDocuments(visual_spec_document_ids_to_invalidate) {
    return {
	type: INVALIDATE_VISUAL_SPEC_DOCUMENTS,
	visual_spec_document_ids_to_invalidate: visual_spec_document_ids_to_invalidate
    }
}

function announceVisualSpecDocumentSaveFailed(error) {
    return {
        type: ANNOUNCE_VISUAL_SPEC_DOCUMENT_SAVE_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function announceVisualSpecDocumentsSaved(visual_spec_document_ids) {
    return {
        type: ANNOUNCE_VISUAL_SPEC_DOCUMENTS_SAVED,
        visual_spec_document_ids: visual_spec_document_ids,
        saved_at: Date.now()
    }
}

function announceVisualSpecDocumentsSaving(visual_spec_document_ids, field_name, new_value) {
    return {
        type: ANNOUNCE_VISUAL_SPEC_DOCUMENTS_SAVING,
        visual_spec_document_ids: visual_spec_document_ids,
	field_name: field_name,
	new_value: new_value
    }
}



function announceLoadingVisualSpecDocuments(visual_spec_document_ids_to_load) {
    return {
        type: ANNOUNCE_LOADING_VISUAL_SPEC_DOCUMENTS,
        visual_spec_document_ids_to_load: visual_spec_document_ids_to_load
    }
}

function announceVisualSpecDocumentsLoaded(payload) {

    return {
        type: ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOADED,
        items_by_id: keyBy(payload.visual_spec_documents, 'id'),
	received_at: Date.now()
    }
}

function announceVisualSpecDocumentsLoadFailed(error) {
    return {
        type: ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function fetchVisualSpecDocumentsPromise(dispatch, state, visual_spec_document_ids) {
    return new Promise(function(resolve, reject) {
	dispatch(announceLoadingVisualSpecDocuments(visual_spec_document_ids))

	const params = { filter: { ids: visual_spec_document_ids },
			 pagination: {'enabled': false} }

        return impfetch(state, 'imp/visual_spec_document/', dispatch, {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceVisualSpecDocumentsLoadFailed())
		    reject(json.error)
                } else {
		    dispatch(announceVisualSpecDocumentsLoaded(json.payload))
		    resolve(json.payload)
                }
	    }).catch(function (error) {
		dispatch(announceVisualSpecDocumentsLoadFailed("Failed to load visual spec documents: " + error))
		reject("Failed to load visual spec documents: " + error)
	    })
    })
}

function updateVisualSpecDocument(visual_spec_document_ids, field_name, new_value, on_done) {
    return (dispatch, getState) => {
        const state = getState()
	dispatch(announceVisualSpecDocumentsSaving(visual_spec_document_ids, field_name, new_value))
	let data = {visual_spec_document_ids: visual_spec_document_ids,
                    field_name: field_name,
		    value: new_value }
	return impfetch(state, "imp/visual_spec_document/"+visual_spec_document_ids[0]+"/", dispatch,
			{method: "PUT",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"},
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceVisualSpecDocumentSaveFailed(json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
                 dispatch(announceVisualSpecDocumentsSaved(visual_spec_document_ids))
             }
	     if ( on_done ) {
		 on_done()
	     }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceVisualSpecDocumentSaveFailed(error))
	 })
    }
}

export function fetchProjectsIfNeeded(list_key) {
    const matching_items_key = ENTITY_KEY__VISUAL_SPEC_DOCUMENT
    const matching_items_promise_func = fetchVisualSpecDocumentsPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}

export function ensureVisualSpecDocumentsLoaded(visual_spec_document_ids) {
    return (dispatch, getState) => {
        const state = getState()
        const visual_spec_document_ids_to_load = getMissingItemIds(state, visual_spec_document_ids, ENTITY_KEY__VISUAL_SPEC_DOCUMENT)
        if ( visual_spec_document_ids_to_load.length > 0 ) {
            fetchVisualSpecDocumentsPromise(dispatch, state, visual_spec_document_ids_to_load)
        }
    }
}

export function getVisualSpecDocument(state, visual_spec_document_id) {
    return ((state[ENTITY_KEY__VISUAL_SPEC_DOCUMENT] || {}).items_by_id || {})[parseInt(visual_spec_document_id)] || null
}

export function getVisualSpecDocuments(state, visual_spec_document_ids) {
    const items_by_id = (state[ENTITY_KEY__VISUAL_SPEC_DOCUMENT] || {}).items_by_id || {}
    const docs = map(visual_spec_document_ids, function(id) {
        return items_by_id[id]
    })
    return compact(docs)
}

export function reorderVisualSpecDocument(visual_spec_document_ids, moving_visual_spec_document_id, visual_spec_document_id_after, on_done) {
    return (dispatch, getState) => {
        const state = getState()
        const item_id_to_move = moving_visual_spec_document_id
        const item_id_to_move_after = visual_spec_document_id_after
        const item_ids = map(visual_spec_document_ids, function(id) { return "" + id })
        
        const index_of_item_id_to_move = indexOf(item_ids, item_id_to_move)
        const index_of_item_id_to_after = indexOf(item_ids, item_id_to_move_after)
        const reordered_item_ids = move(item_ids, index_of_item_id_to_move, index_of_item_id_to_after)
        dispatch(updateVisualSpecDocument([moving_visual_spec_document_id], "visual_spec_document_id_after",
                                          visual_spec_document_id_after, on_done))
    }
}
