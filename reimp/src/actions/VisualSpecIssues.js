import { impfetch } from './lib.js'

import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__VISUAL_SPEC_ISSUE } from '../actions/ItemListKeyRegistry'
import map from 'lodash/map'
import difference from 'lodash/difference'
import keyBy from 'lodash/keyBy'

export const ANNOUNCE_VISUAL_SPEC_ISSUES_SAVING = 'ANNOUNCE_VISUAL_SPEC_ISSUES_SAVING'
export const ANNOUNCE_VISUAL_SPEC_ISSUES_SAVED = 'ANNOUNCE_VISUAL_SPEC_ISSUES_SAVED'
export const ANNOUNCE_VISUAL_SPEC_ISSUE_SAVE_FAILED = 'ANNOUNCE_VISUAL_SPEC_ISSUE_SAVE_FAILED'

export const ANNOUNCE_VISUAL_SPEC_ISSUES_LOADED = 'ANNOUNCE_VISUAL_SPEC_ISSUES_LOADED'
export const ANNOUNCE_VISUAL_SPEC_ISSUES_LOAD_FAILED = 'ANNOUNCE_VISUAL_SPEC_ISSUES_LOAD_FAILED'
export const ANNOUNCE_LOADING_VISUAL_SPEC_ISSUES = 'ANNOUNCE_LOADING_VISUAL_SPEC_ISSUES'
export const INVALIDATE_VISUAL_SPEC_ISSUES = 'INVALIDATE_VISUAL_SPEC_ISSUES'
export const INVALIDATE_ALL_VISUAL_SPEC_ISSUES = 'INVALIDATE_ALL_VISUAL_SPEC_ISSUES'

export const ANNOUNCE_VISUAL_SPEC_ISSUES_CREATING = 'ANNOUNCE_VISUAL_SPEC_ISSUES_CREATING'
export const ANNOUNCE_VISUAL_SPEC_ISSUES_CREATED = 'ANNOUNCE_VISUAL_SPEC_ISSUES_CREATED'
export const ANNOUNCE_VISUAL_SPEC_ISSUES_CREATE_FAILED = 'ANNOUNCE_VISUAL_SPEC_ISSUES_CREATE_FAILED'

export const ANNOUNCE_DELETING_VISUAL_SPEC_ISSUE = 'ANNOUNCE_DELETING_VISUAL_SPEC_ISSUE'
export const ANNOUNCE_VISUAL_SPEC_ISSUE_DELETED = 'ANNOUNCE_VISUAL_SPEC_ISSUE_DELETED'
export const ANNOUNCE_DELETE_VISUAL_SPEC_ISSUE_FAILED = 'ANNOUNCE_DELETE_VISUAL_SPEC_ISSUE_FAILED'

export function invalidateAllVisualSpecIssues() {
    return {
        type: INVALIDATE_ALL_VISUAL_SPEC_ISSUES
    }
}

export function invalidateVisualSpecIssues(visual_spec_issue_ids) {
    return {
        type: INVALIDATE_VISUAL_SPEC_ISSUES,
	      visual_spec_issue_ids_to_invalidate: visual_spec_issue_ids
    }
}

function announceLoadingVisualSpecIssues(visual_spec_issue_ids) {
    return {
        type: ANNOUNCE_LOADING_VISUAL_SPEC_ISSUES,
	      visual_spec_issue_ids_to_load: visual_spec_issue_ids
    }
}

function announceVisualSpecIssuesLoaded(payload) {
    return {
        type: ANNOUNCE_VISUAL_SPEC_ISSUES_LOADED,
        items_by_id: keyBy(payload.visual_spec_issues, 'id'),
	received_at: Date.now()
    }
}

function announceVisualSpecIssuesLoadFailed(error) {
    return {
        type: ANNOUNCE_VISUAL_SPEC_ISSUES_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function fetchVisualSpecIssuesPromise(dispatch, state, visual_spec_issue_ids) {
    return new Promise(function(resolve, reject) {
	      dispatch(announceLoadingVisualSpecIssues(visual_spec_issue_ids))
	      const params = { filter: { ids: visual_spec_issue_ids },
			       pagination: {'enabled': false} }

        return impfetch(state, 'imp/visual_spec_issue/', dispatch, {params:params})
	          .then(response => response.json())
	          .then(json => {
                if (json.status !== 'success') {
		                dispatch(announceVisualSpecIssuesLoadFailed())
		                reject(json.error)
                } else {
		                dispatch(announceVisualSpecIssuesLoaded(json.payload))
		                resolve(json.payload)
                }
	          }).catch(function (error) {
		            dispatch(announceVisualSpecIssuesLoadFailed("Failed to load visual_spec_issues: " + error))
		            reject("Failed to load visual_spec_issues: " + error)
	          })
    })
}

export function fetchVisualSpecIssuesIfNeeded(list_key) {
    const matching_items_key = ENTITY_KEY__VISUAL_SPEC_ISSUE
    const matching_items_promise_func = fetchVisualSpecIssuesPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}

export function ensureVisualSpecIssuesLoaded(visual_spec_issue_ids) {
    return (dispatch, getState) => {
        const state = getState()

        const visual_spec_issue_ids_to_load = getMissingItemIds(state, visual_spec_issue_ids, 'visual_spec_issue')
        if ( visual_spec_issue_ids_to_load.length > 0 ) {
            fetchVisualSpecIssuesPromise(dispatch, state, visual_spec_issue_ids_to_load)
        }
    }
}

export function getVisualSpecIssue(state, visual_spec_issue_id) {
    return ((state.visual_spec_issue || {}).items_by_id || {})[visual_spec_issue_id] || null
}

export function getVisualSpecIssues(state, visual_spec_issue_ids) {
    const visual_spec_issue_objs = state.visual_spec_issue
    const items_by_id = (visual_spec_issue_objs && visual_spec_issue_objs.items_by_id) || {}
    return items_by_id && visual_spec_issue_ids && visual_spec_issue_ids.map(function (visual_spec_issue_id, index) {
        return items_by_id[visual_spec_issue_id] || {
            'id': visual_spec_issue_id,
            'loaded': false
        }
    })
}

function announceVisualSpecIssueSaveFailed(error) {
    return {
        type: ANNOUNCE_VISUAL_SPEC_ISSUE_SAVE_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function announceVisualSpecIssuesSaved(visual_spec_issue_ids) {
    return {
        type: ANNOUNCE_VISUAL_SPEC_ISSUES_SAVED,
        visual_spec_issue_ids: visual_spec_issue_ids,
        saved_at: Date.now()
    }
}

function announceVisualSpecIssuesCreating() {
    return {
        type: ANNOUNCE_VISUAL_SPEC_ISSUES_CREATING
    }
}

function announceVisualSpecIssueCreated() {
    return {
        type: ANNOUNCE_VISUAL_SPEC_ISSUES_CREATED
    }
}

function announceVisualSpecIssueCreateFailed() {
    return {
        type: ANNOUNCE_VISUAL_SPEC_ISSUES_CREATE_FAILED
    }
}


function announceVisualSpecIssuesSaving(visual_spec_issue_ids) {
    return {
        type: ANNOUNCE_VISUAL_SPEC_ISSUES_SAVING,
        visual_spec_issue_ids: visual_spec_issue_ids,
    }
}

function announceDeletingVisualSpecIssue(visual_spec_issue_id) {
    return {
        type: ANNOUNCE_DELETING_VISUAL_SPEC_ISSUE,
	      deleting_visual_spec_issue_id: visual_spec_issue_id
    }
}

export function announceVisualSpecIssueDeleted(visual_spec_issue_id) {
    return {
	      type: ANNOUNCE_VISUAL_SPEC_ISSUE_DELETED,
	      deleted_visual_spec_issue_id: visual_spec_issue_id
    }
}

function announceVisualSpecIssueDeleteFailed(visual_spec_issue_id, error) {
    return {
        type: ANNOUNCE_DELETE_VISUAL_SPEC_ISSUE_FAILED,
	      deleting_visual_spec_issue_id: visual_spec_issue_id,
	      error: error
    }
}

function updateVisualSpecIssue(visual_spec_issue_ids, shape, x_pos, y_pos, on_done) {
    return (dispatch, getState) => {
        const state = getState()
	dispatch(announceVisualSpecIssuesSaving(visual_spec_issue_ids))
	let data = {visual_spec_issue_ids: visual_spec_issue_ids,
                    shape: shape,
                    x_pos: x_pos,
                    y_pos: y_pos}
	return impfetch(state, "imp/visual_spec_issue/"+visual_spec_issue_ids[0]+"/", dispatch,
			{method: "PUT",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"},
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceVisualSpecIssueSaveFailed(json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
                 dispatch(announceVisualSpecIssuesSaved(visual_spec_issue_ids))
             }
	     if ( on_done ) {
		 on_done()
	     }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceVisualSpecIssueSaveFailed(error))
	 })
    }
}

export function createVisualSpecIssue(visual_spec_document_id, shape, x_pos, y_pos) {

    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceVisualSpecIssuesCreating())
	let data = {visual_spec_document_id: visual_spec_document_id,
                    order: 1,
                    shape: shape,
                    x_pos: x_pos,
                    y_pos: y_pos}

	return impfetch(state, "imp/visual_spec_issue/", dispatch,
			{method: "POST",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"},
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceVisualSpecIssueCreateFailed(json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceVisualSpecIssueCreated(json.payload.visual_spec_issue))
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceVisualSpecIssueSaveFailed(error))
	 })
    }

}

export function deleteVisualSpecIssue(visual_spec_issue_id) {
    return (dispatch, getState) => {
	      const state = getState()
	      dispatch(announceDeletingVisualSpecIssue(visual_spec_issue_id))
	      let data = { visual_spec_issue_id: visual_spec_issue_id }
	      return impfetch( state, "imp/visual_spec_issue/", dispatch,
			                   {method: "DELETE",
			                    credentials: 'same-origin',
			                    data: data,
			                    headers: {"Content-type": "application/json; charset=UTF-8"},
			                    body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceVisualSpecIssueDeleteFailed(visual_spec_issue_id, json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
		             dispatch(announceVisualSpecIssueDeleted(visual_spec_issue_id))
             }
	       })
	       .catch(function (error) {
             console.log('Request failed', error);
	           dispatch(announceVisualSpecIssueDeleteFailed(visual_spec_issue_id, error))
	       })
    }
}

export function is_visual_spec_issue_invalidated(state, visual_spec_issue_id) {
    return (((state.visual_spec_issue || {}).invalidated_item_ids) || []).indexOf(visual_spec_issue_id) !== -1
}
