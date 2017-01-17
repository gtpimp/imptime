import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import map from 'lodash/map'
import { setErrorMessage } from '../actions/Error'

export const ANNOUNCE_ISSUE_GENERAL_DETAILS_LOADED = 'ANNOUNCE_ISSUES_GENERAL_DETAILS_LOADED'
export const ANNOUNCE_ISSUE_GENERAL_DETAILS_LOAD_FAILED = 'ANNOUNCE_ISSUE_GENERAL_DETAILS_LOAD_FAILED'
export const ANNOUNCE_LOADING_ISSUE_GENERAL_DETAILS = 'ANNOUNCE_LOADING_ISSUE_GENERAL_DETAILS'
export const INVALIDATE_ISSUE_GENERAL_DETAILS = 'INVALIDATE_ISSUE_GENERAL_DETAILS'

export function invalidateIssueGeneralDetails(issue_ids_to_invalidate) {
    return {
	type: INVALIDATE_ISSUE_GENERAL_DETAILS,
	issue_ids_to_invalidate: issue_ids_to_invalidate
    }
}

function announceLoadingIssueGeneralDetails(issue_ids_to_load) {
    return {
        type: ANNOUNCE_LOADING_ISSUE_GENERAL_DETAILS,
        issue_ids_to_load: issue_ids_to_load
    }
}

function announceIssueGeneralDetailsLoaded(payload) {

    let items_by_id = {}
    payload.issues.map((item, index) => {
        items_by_id[item.id] = item
    });
    
    return {
        type: ANNOUNCE_ISSUE_GENERAL_DETAILS_LOADED,
        items_by_id: items_by_id,
	received_at: Date.now()
    }
}

function announceIssueGeneralDetailsLoadFailed(error) {
    return {
        type: ANNOUNCE_ISSUE_GENERAL_DETAILS_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function fetchIssueGeneralDetails(dispatch, issue_ids) {
    return (dispatch, getState) => {
	dispatch(announceLoadingIssueGeneralDetails(issue_ids))

	const params = { filter: { ids: issue_ids },
			 format: { detail_level: 'general' },
			 pagination: {'enabled': false} }
	
        return impfetch('/imp/issue/', {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status != 'success') {
		    dispatch(announceIssueGeneralDetailsLoadFailed(json.error))
                } else {
		    dispatch(announceIssueGeneralDetailsLoaded(json.payload))
                }
	    }).catch(function (error) {
		dispatch(announceIssueGeneralDetailsLoadFailed("Failed to load issues: " + error.message))
	    })
    }
}

function getMissingIssueGeneralDetails(state, required_issue_ids) {
    const matching_items = state.issue_general_details || {}
    const matching_item_ids = keys(matching_items.items_by_id || {})
    let matching_item_refs = matching_item_ids.map((item_id, index) => "" + item_id)
    const invalidated_item_ids = matching_items.invalidated_item_ids
    matching_item_refs = difference(matching_item_refs, invalidated_item_ids)

    const required_item_refs = required_issue_ids.map((item_id, index) => "" + item_id)
    const loading_item_ids = matching_items.loading_item_ids
    let missing_item_ids = difference(required_item_refs, matching_item_refs)
    missing_item_ids = difference(missing_item_ids, loading_item_ids)
    
    return missing_item_ids
}

export function fetchIssueGeneralDetailsIfNeeded(issue_ids) {
    return (dispatch, getState) => {
	const state = getState()
	const missing_issue_ids = getMissingIssueGeneralDetails(state, issue_ids)
	if ( missing_issue_ids.length > 0 ) {
	    dispatch(fetchIssueGeneralDetails(dispatch, missing_issue_ids))
	}
    }
}
