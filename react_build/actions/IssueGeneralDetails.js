import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import map from 'lodash/map'

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

function announceLoadingIssueGeneralDetails() {
    return {
        type: ANNOUNCE_LOADING_ISSUE_GENERAL_DETAILS
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

function announceIssueGeneralDetailsLoadFailed(error_message) {
    return {
        type: ANNOUNCE_ISSUE_GENERAL_DETAILS_LOAD_FAILED,
        error_message: error_message,
        received_at: Date.now()
    }
}

function fetchIssueGeneralDetails(dispatch, issue_ids) {
    return (dispatch, getState) => {
	dispatch(announceLoadingIssueGeneralDetails())

	const params = { filter: { ids: issue_ids },
			 format: { detail_level: 'general' },
			 pagination: {'enabled': false} }
	
        return impfetch('/imp/issue/', {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status != 'success') {
		    dispatch(announceIssueGeneralDetailsLoadFailed())
		    reject(json.error_message)
                } else {
		    dispatch(announceIssueGeneralDetailsLoaded(json.payload))
                }
	    }).catch(function (error) {
		dispatch(announceIssueGeneralDetailsLoadFailed("Failed to load issues: " + error.message))
		reject("Failed to load issues: " + error.message)
	    })
    }
}

function getMissingIssueGeneralDetails(state, required_issue_ids) {
    const matching_items = state.issue_general_details || {}
    const matching_items_ids = keys(matching_items.items_by_id || {})
    const matching_item_refs = matching_item_ids.map((item_id, index) => "" + item_id)
    const unmatching_item_ids = difference(required_item_refs, matching_item_refs)
    return unmatching_item_ids
}

export function fetchIssueGeneralDetailsIfNeeded(issue_ids) {
    return (dispatch, getState) => {
	const state = getState()
	const missing_issue_ids = getMissingIssueGeneralDetails(dispatch, issue_ids)
	if ( missing_issue_ids.length > 0 ) {
	    fetchIssueGeneralDetails(dispatch, missing_issue_ids)
	}
    }
}
