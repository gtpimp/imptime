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

export function updateIssueDescription(issue_id, value) {
    return updateIssue(issue_id, "description", value)
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

export function startCandidateIssue(sprint_id, issue_id_before) {
    return {
	key: ANNOUNCE_CAPTURING_NEW_ISSUE,
	issue_id_before: issue_id_before,
	sprint_id: sprint_id
    }
}

export function updateCandidateSubject(subject) {
    return {
	key: UPDATE_NEW_ISSUE_DETAILS,
	candidate_issue: { "subject": subject }
    }
}

export function cancelCandidateIssue() {
    return {
	key: CANCEL_CREATING_NEW_ISSUE
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
		 dispatch(announceCandidateIssueSaved(json.payload))
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceCandidateIssueSaveFailed(error))
	 })
    }

}

