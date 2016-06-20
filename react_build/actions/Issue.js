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

function announceIssueSaveFailed(error) {
    return {
        type: ANNOUNCE_ISSUE_SAVE_FAILED,
        error_message: error_message,
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

export function updateIssueSubject(issue_id, value) {
    return updateIssue(issue_id, "subject", value)
}

function updateIssue(issue_id, field_name, new_value) {
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
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceIssueSaveFailed(json.error))
	 })
    }
}

