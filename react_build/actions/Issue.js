import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import map from 'lodash/map'
import { fetchListIfNeeded } from './ItemList'
import {
    invalidateIssues,
    fetchIssuesIfNeeded
} from './Issues'


export const ANNOUNCE_ISSUE_SAVING = 'ANNOUNCE_ISSUE_SAVING'
export const ANNOUNCE_ISSUE_SAVED = 'ANNOUNCE_ISSUE_SAVED'
export const ANNOUNCE_ISSUE_SAVE_FAILED = 'ANNOUNCE_ISSUE_SAVE_FAILED'

export const ANNOUNCE_CAPTURING_NEW_ISSUE = 'ANNOUNCE_CAPTURING_NEW_ISSUE'
export const UPDATE_NEW_ISSUE_DETAILS = 'UPDATE_NEW_ISSUE_DETAILS'
export const CANCEL_CREATING_NEW_ISSUE = 'CANCEL_CREATING_NEW_ISSUE'
export const ANNOUNCE_SAVING_NEW_ISSUE = 'ANNOUNCE_SAVING_NEW_ISSUE'
export const ANNOUNCE_SAVED_NEW_ISSUE = 'ANNOUNCE_SAVED_NEW_ISSUE'
export const ANNOUNCE_SAVING_NEW_ISSUE_FAILED = 'ANNOUNCE_SAVING_NEW_ISSUE_FAILED'

export const ANNOUNCE_DELETING_ISSUE = 'ANNOUNCE_DELETING_ISSUE'
export const ANNOUNCE_ISSUE_DELETED = 'ANNOUNCE_ISSUE_DELETED'
export const ANNOUNCE_DELETE_ISSUE_FAILED = 'ANNOUNCE_DELETE_ISSUE_FAILED'

function announceIssueSaveFailed(error) {
    return {
        type: ANNOUNCE_ISSUE_SAVE_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function announceIssueSaved(issue_id) {
    return {
        type: ANNOUNCE_ISSUE_SAVED,
        issue_id: issue_id,
        saved_at: Date.now()
    }
}

function announceIssueSaving(issue_id) {
    return {
        type: ANNOUNCE_ISSUE_SAVING,
        issue_id: issue_id,
        saved_at: Date.now()
    }
}

function announceCandidateIssueSaving() {
    return {
        type: ANNOUNCE_SAVING_NEW_ISSUE
    }
}

function announceCandidateIssueSaved(new_issue) {
    return {
        type: ANNOUNCE_SAVED_NEW_ISSUE,
	issue: new_issue
    }
}

function announceCandidateIssueSaveFailed(error) {
    return {
	type: ANNOUNCE_SAVING_NEW_ISSUE_FAILED,
	error: error
    }
}

export function updateIssueSubject(issue_id, value) {
    return updateIssue(issue_id, "subject", value)
}

export function updateIssueStatus(issue_id, value) {
    return updateIssue(issue_id, "status", value)
}

export function updateIssueFeature(issue_id, value) {
    return updateIssue(issue_id, "feature", value)
}

export function updateIssueDescription(issue_id, value) {
    return updateIssue(issue_id, "description", value)
}

export function updateIssueAssignedTo(issue_id, value) {
    return updateIssue(issue_id, "assigned_to_id", value)
}

function announceDeletingIssue(issue_id) {
    return {
        type: ANNOUNCE_DELETING_ISSUE,
	deleting_issue_id: issue_id
    }
}

export function announceIssueDeleted(issue_id) {
    return {
	type: ANNOUNCE_ISSUE_DELETED,
	deleted_issue_id: issue_id
    }
}

function announceIssueDeleteFailed(issue_id, error) {
    return {
        type: ANNOUNCE_DELETE_ISSUE_FAILED,
	deleting_issue_id: issue_id,
	error: error
    }
}

function updateIssue(issue_id, field_name, new_value, on_done) {
    return (dispatch, getState) => {
	dispatch(announceIssueSaving(issue_id))
	let data = {field_name: field_name,
		    value: new_value }
	return impfetch("/imp/issue/"+issue_id+"/",
			{method: "PUT",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"}, 
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status != 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceIssueSaveFailed(json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceIssueSaved(json.payload))
		 dispatch(invalidateIssues([issue_id]))
             }
	     if ( on_done ) {
		 on_done()
	     }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceIssueSaveFailed(error))
	 })
    }
}

export function reorderIssue(issue_id_before, issue_id_after, on_done) {
    return updateIssue(issue_id_before, "issue_id_after", issue_id_after, on_done)
}

export function startCandidateIssue(list_key) {
    return (dispatch, getState) => {
	const state = getState()
	const issues_by_id = state.issue.items_by_id
	const l = state.item_list[list_key]

	const selected_ids = l.selected_ids

	let issue_id_before = null
	if ( selected_ids.length > 0 ) {
	    issue_id_before = selected_ids[0]
	    const issue_before = issues_by_id[issue_id_before] 
	}
	
	dispatch({
	    type: ANNOUNCE_CAPTURING_NEW_ISSUE,
	    issue_id_before: issue_id_before,
	    sprint_id: l.filter.sprint_id
	})
    }
}

export function updateCandidateSubject(subject) {
    return {
	type: UPDATE_NEW_ISSUE_DETAILS,
	candidate_issue: { "subject": subject }
    }
}

export function cancelCandidateIssue() {
    return {
	type: CANCEL_CREATING_NEW_ISSUE
    }
}

export function saveCandidateIssue() {

    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceCandidateIssueSaving())
	let data = {issue: state.issue.candidate_issue}
	
	return impfetch("/imp/issue/",
			{method: "POST",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"}, 
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status != 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceCandidateIssueSaveFailed(json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceCandidateIssueSaved(json.payload.issue))
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceCandidateIssueSaveFailed(error))
	 })
    }

}

export function deleteIssue(issue_id) {
    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceDeletingIssue(issue_id))
	let data = { issue_id: issue_id }
	return impfetch("/imp/issue/",
			{method: "DELETE",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"}, 
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status != 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceIssueDeleteFailed(issue_id, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceIssueDeleted(issue_id))
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceIssueDeleteFailed(issue_id, error))
	 })
    }
}

