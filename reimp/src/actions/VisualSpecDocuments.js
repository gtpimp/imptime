import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import keyBy from 'lodash/keyBy'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__VISUAL_SPEC_DOCUMENT } from '../actions/ItemListKeyRegistry'

export const ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOADED = 'ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOADED'
export const ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOAD_FAILED = 'ANNOUNCE_VISUAL_SPEC_DOCUMENTS_LOAD_FAILED'
export const ANNOUNCE_LOADING_VISUAL_SPEC_DOCUMENTS = 'ANNOUNCE_LOADING_VISUAL_SPEC_DOCUMENTS'
export const INVALIDATE_VISUAL_SPEC_DOCUMENTS = 'INVALIDATE_VISUAL_SPEC_DOCUMENTS'
export const INVALIDATE_ALL_VISUAL_SPEC_DOCUMENTS = 'INVALIDATE_ALL_VISUAL_SPEC_DOCUMENTS'

export function invalidateAllProjectDashboards() {
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
    return ((state[ENTITY_KEY__VISUAL_SPEC_DOCUMENT] || {}).items_by_id || {})[visual_spec_document_id] || null
}
