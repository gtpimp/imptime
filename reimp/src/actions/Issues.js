import { impfetch } from './lib.js'

import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__ISSUE } from '../actions/ItemListKeyRegistry'
import map from 'lodash/map'
import difference from 'lodash/difference'
import keyBy from 'lodash/keyBy'
import { getUser } from '../actions/Users'

export const ANNOUNCE_ISSUES_SAVING = 'ANNOUNCE_ISSUES_SAVING'
export const ANNOUNCE_ISSUES_SAVED = 'ANNOUNCE_ISSUES_SAVED'
export const ANNOUNCE_ISSUE_SAVE_FAILED = 'ANNOUNCE_ISSUE_SAVE_FAILED'

export const ANNOUNCE_ISSUES_LOADED = 'ANNOUNCE_ISSUES_LOADED'
export const ANNOUNCE_ISSUES_LOAD_FAILED = 'ANNOUNCE_ISSUES_LOAD_FAILED'
export const ANNOUNCE_LOADING_ISSUES = 'ANNOUNCE_LOADING_ISSUES'
export const INVALIDATE_ISSUES = 'INVALIDATE_ISSUES'
export const INVALIDATE_ALL_ISSUES = 'INVALIDATE_ALL_ISSUES'

export const ANNOUNCE_CAPTURING_NEW_ISSUE = 'ANNOUNCE_CAPTURING_NEW_ISSUE'
export const UPDATE_NEW_ISSUE_DETAILS = 'UPDATE_NEW_ISSUE_DETAILS'
export const CANCEL_CREATING_NEW_ISSUE = 'CANCEL_CREATING_NEW_ISSUE'
export const ANNOUNCE_SAVING_NEW_ISSUE = 'ANNOUNCE_SAVING_NEW_ISSUE'
export const ANNOUNCE_SAVED_NEW_ISSUE = 'ANNOUNCE_SAVED_NEW_ISSUE'
export const ANNOUNCE_SAVING_NEW_ISSUE_FAILED = 'ANNOUNCE_SAVING_NEW_ISSUE_FAILED'

export const ANNOUNCE_DELETING_ISSUE = 'ANNOUNCE_DELETING_ISSUE'
export const ANNOUNCE_ISSUE_DELETED = 'ANNOUNCE_ISSUE_DELETED'
export const ANNOUNCE_DELETE_ISSUE_FAILED = 'ANNOUNCE_DELETE_ISSUE_FAILED'

export function invalidateAllIssues() {
    return {
        type: INVALIDATE_ALL_ISSUES
    }
}

export function invalidateIssues(issue_ids) {

    return {
        type: INVALIDATE_ISSUES,
	      issue_ids_to_invalidate: issue_ids
    }
}

function announceLoadingIssues(issue_ids) {
    return {
        type: ANNOUNCE_LOADING_ISSUES,
	      issue_ids_to_load: issue_ids
    }
}

function announceIssuesLoaded(payload) {

    // let items_by_id = {}
    // payload.issues.map((item, index) => {
    //     items_by_id[item.id] = item
    // });

    return {
        type: ANNOUNCE_ISSUES_LOADED,
        items_by_id: keyBy(payload.issues, 'id'),
	      received_at: Date.now()
    }
}

function announceIssuesLoadFailed(error) {
    return {
        type: ANNOUNCE_ISSUES_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function fetchIssuesPromise(dispatch, state, issue_ids) {
    return new Promise(function(resolve, reject) {
	      dispatch(announceLoadingIssues(issue_ids))

	      const params = { filter: { ids: issue_ids },
			                   pagination: {'enabled': false} }

        return impfetch(state, 'imp/issue/', dispatch, {params:params})
	          .then(response => response.json())
	          .then(json => {
                if (json.status !== 'success') {
		                dispatch(announceIssuesLoadFailed())
		                reject(json.error)
                } else {
		                dispatch(announceIssuesLoaded(json.payload))
		                resolve(json.payload)
                }
	          }).catch(function (error) {
		            dispatch(announceIssuesLoadFailed("Failed to load issues: " + error))
		            reject("Failed to load issues: " + error)
	          })
    })
}

export function fetchIssuesIfNeeded(list_key) {
    const matching_items_key = ENTITY_KEY__ISSUE
    const matching_items_promise_func = fetchIssuesPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}

export function ensureIssuesLoaded(issue_ids) {
    return (dispatch, getState) => {
        const state = getState()

        const issue_ids_to_load = getMissingItemIds(state, issue_ids, 'issue')
        if ( issue_ids_to_load.length > 0 ) {
            fetchIssuesPromise(dispatch, state, issue_ids_to_load)
        }
    }
}

export function getIssue(state, issue_id) {
    // Only gets the issue if it's already loaded, use
    // ensureIssuesLoaded to trigger a fetch from the server
    return ((state.issue || {}).items_by_id || {})[issue_id] || null
}

/* export function getComment(state, issue_id, comment_id) {
 *     return (dispatch, getState) => {
 *         dispatch(ensureIssuesLoaded([issue_id]))
 *         const issue = dispatch(getIssue(state, issue_id))
 *         const comment = issue
 *         return comment
 *     }
 * }*/

export function getIssues(state, issue_ids) {
    const issue_objs = state.issue
    const items_by_id = (issue_objs && issue_objs.items_by_id) || {}
    return items_by_id && issue_ids && issue_ids.map(function (issue_id, index) {
        return items_by_id[issue_id] || {
            'id': issue_id,
            'loaded': false
        }
    })
}

export function populateEstimates(state, issue) {
    map(issue.all_estimates, function (estimate) {
        estimate.user = getUser(state, estimate.user_id)
    })
}

function announceIssueSaveFailed(error) {
    return {
        type: ANNOUNCE_ISSUE_SAVE_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function announceIssuesSaved(issue_ids) {
    return {
        type: ANNOUNCE_ISSUES_SAVED,
        issue_ids: issue_ids,
        saved_at: Date.now()
    }
}

function announceIssuesSaving(issue_ids, field_name, new_value) {
    return {
        type: ANNOUNCE_ISSUES_SAVING,
        issue_ids: issue_ids,
	      field_name: field_name,
	      new_value: new_value
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
    return updateIssue([issue_id], "subject", value)
}

export function updateIssueStatus(issue_ids, value) {
    return updateIssue(issue_ids, "status_name", value)
}

export function updateIssueFeature(issue_id, value) {
    return updateIssue([issue_id], "feature_name", value)
}

export function updateIssueDescription(issue_id, value) {
    return updateIssue([issue_id], "description", value)
}

export function updateIssueAssignedTo(issue_ids, value) {
    return updateIssue(issue_ids, "assigned_to_id", value)
}

export function updateIssueToggleAsFeature(issue_ids, value) {
    return updateIssue(issue_ids, 'can_group_issues', value)
}

export function moveIssuesToSprint(issue_ids, new_sprint_id) {
    return updateIssue(issue_ids, 'sprint_id', new_sprint_id)
}

export function groupIssuesIntoFeature(children_issue_ids, feature_issue_id) {
    return updateIssue(children_issue_ids, "parent_group_id", feature_issue_id)
}

export function updateIssueComment(issue_id, comment_id, new_comment) {

    return (dispatch, getState) => {
	      const state = getState()
	      dispatch(announceIssuesSaving([issue_id], 'comment', new_comment))
	      let data = { issue_id: issue_id,
                     comment_id: comment_id,
                     comment: new_comment }
	      return impfetch( state, "imp/issue/comment/0/", dispatch,
			                   {method: "PUT",
			                    credentials: 'same-origin',
			                    data: data,
			                    headers: {"Content-type": "application/json; charset=UTF-8"},
			                    body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceIssueSaveFailed(issue_id, json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
		             dispatch(announceIssuesSaved([issue_id]))
             }
	       })
	       .catch(function (error) {
             console.log('Request failed', error);
	           dispatch(announceIssueSaveFailed(issue_id, error))
	       })
    }
}

export function createIssueComment(issue_id, new_comment) {
    return (dispatch, getState) => {
	      const state = getState()
	      dispatch(announceIssuesSaving([issue_id], 'comment', new_comment))
	      let data = { issue_id: issue_id,
                     comment: new_comment }
	      return impfetch( state, "imp/issue/comment/", dispatch,
			                   {method: "POST",
			                    credentials: 'same-origin',
			                    data: data,
			                    headers: {"Content-type": "application/json; charset=UTF-8"},
			                    body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceIssueSaveFailed(issue_id, json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
		             dispatch(announceIssuesSaved([issue_id]))
             }
	       })
	       .catch(function (error) {
             console.log('Request failed', error);
	           dispatch(announceIssueSaveFailed(issue_id, error))
	       })
    }
}

export function deleteIssueComment(issue_id, comment_id) {
    return (dispatch, getState) => {
        const state = getState()
	      dispatch(announceIssuesSaving([issue_id], 'comment', "deleting"))
        let data = { issue_id: issue_id,
                     comment_id: comment_id }
	      return impfetch( state, "imp/issue/comment/0/", dispatch,
			                   {method: "DELETE",
			                    credentials: 'same-origin',
			                    data: data,
			                    headers: {"Content-type": "application/json; charset=UTF-8"},
			                    body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceIssueSaveFailed(issue_id, json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
		             dispatch(announceIssuesSaved([issue_id]))
             }
	       })
	       .catch(function (error) {
             console.log('Request failed', error);
	           dispatch(announceIssueSaveFailed(issue_id, error))
	       })
    }
}

export function deleteIssueAttachment(issue_id, attachment_id) {
    return (dispatch, getState) => {
        const state = getState()
	      dispatch(announceIssuesSaving([issue_id], 'attachment', "deleting"))
        let data = { issue_id: issue_id }
	      return impfetch( state, "imp/issue/attachment/"+attachment_id+"/", dispatch,
			                   {method: "DELETE",
			                    credentials: 'same-origin',
			                    data: data,
			                    headers: {"Content-type": "application/json; charset=UTF-8"},
			                    body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceIssueSaveFailed(issue_id, json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
		             dispatch(announceIssuesSaved([issue_id]))
             }
	       })
	       .catch(function (error) {
             console.log('Request failed', error);
	           dispatch(announceIssueSaveFailed(issue_id, error))
	       })
    }
}

export function groupUnsortedIssuesIntoFeature(issue_ids) {

    return (dispatch, getState) => {
        const state = getState()
        event.stopPropagation()
        if (issue_ids.length === 1) {
            alert("Please select a single feature issue and at least one other issue to group together")
            return
        }
        let feature_issue = null
        let ok_to_group = true
        const issues = getIssues(state, issue_ids)
        map(issues, function (issue) {
            if (issue.can_group_issues) {
                if (feature_issue) {
                    alert("Please select only one feature issue to group with")
                    ok_to_group = false
                } else {
                    feature_issue = issue
                }
            }
        })
        if (feature_issue === null) {
            alert("Please select a feature issue to group into")
            ok_to_group = false
        }
        if (!ok_to_group) {
            return
        }

        const children_issue_ids = difference(issue_ids, [feature_issue.id])
        dispatch(groupIssuesIntoFeature(children_issue_ids, feature_issue.id))
    }
}


export function ungroupIssuesIntoFeature(issue_ids) {

    return (dispatch, getState) => {
        let ok_to_ungroup = true
        if (issue_ids.length === 0) {
            alert("Please select at least one child issue to ungroup")
            ok_to_ungroup = false
        }
        if (!ok_to_ungroup) {
            return
        }
        dispatch(updateIssue(issue_ids, "parent_group_id", null))
    }
}

export function addTag(issue_ids, tag_category_name, tag_name, on_done) {
    return (dispatch, getState) => {
        const state = getState()
	      dispatch(announceIssuesSaving(issue_ids, "tags", tag_category_name + ":" + tag_name))
	      let data = {issue_ids: issue_ids,
                    tag_category_name: tag_category_name,
                    tag_name: tag_name}
	      return impfetch(state, "imp/issue/tag/", dispatch,
			                  {method: "POST",
			                   credentials: 'same-origin',
			                   data: data,
			                   headers: {"Content-type": "application/json; charset=UTF-8"},
			                   body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceIssueSaveFailed(json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
                 dispatch(announceIssuesSaved(issue_ids))
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

export function deleteTag(issue_ids, tag_category_name, tag_name) {
    return (dispatch, getState) => {
        const state = getState()
	      dispatch(announceIssuesSaving(issue_ids, "tags", tag_category_name + ":" + tag_name))
	      let data = {issue_ids: issue_ids,
                    tag_category_name: tag_category_name,
                    tag_name: tag_name}
	      return impfetch(state, "imp/issue/tag/", dispatch,
			                  {method: "DELETE",
			                   credentials: 'same-origin',
			                   data: data,
			                   headers: {"Content-type": "application/json; charset=UTF-8"},
			                   body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceIssueSaveFailed(json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
                 dispatch(announceIssuesSaved(issue_ids))
             }
	       })
	       .catch(function (error) {
             console.log('Request failed', error);
	           dispatch(announceIssueSaveFailed(error))
	       })
    }
}

export function addEstimate(issue_ids, estimate_hours, on_done) {
    return (dispatch, getState) => {
        const state = getState()
	      dispatch(announceIssuesSaving(issue_ids, "estimate_hours", estimate_hours))
	      let data = {issue_ids: issue_ids,
                    estimate_hours: estimate_hours}
	      return impfetch(state, "imp/issue/estimate/", dispatch,
			                  {method: "POST",
			                   credentials: 'same-origin',
			                   data: data,
			                   headers: {"Content-type": "application/json; charset=UTF-8"},
			                   body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceIssueSaveFailed(json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
                 dispatch(announceIssuesSaved(issue_ids))
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

function updateIssue(issue_ids, field_name, new_value, on_done) {
    return (dispatch, getState) => {
        const state = getState()
	      dispatch(announceIssuesSaving(issue_ids, field_name, new_value))
	      let data = {issue_ids: issue_ids,
                    field_name: field_name,
		                value: new_value }
	      return impfetch(state, "imp/issue/"+issue_ids[0]+"/", dispatch,
			                  {method: "PUT",
			                   credentials: 'same-origin',
			                   data: data,
			                   headers: {"Content-type": "application/json; charset=UTF-8"},
			                   body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
		             console.log('Request failed with JSON response', json);
		             dispatch(announceIssueSaveFailed(json.error))
             } else {
		             console.log('Request succeeded with JSON response', json);
                 dispatch(announceIssuesSaved(issue_ids))
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
    return updateIssue([issue_id_before], "issue_id_after", issue_id_after, on_done)
}

export function startCandidateIssue(sprint_id, issue_id_before) {
    return (dispatch, getState) => {
	      const state = getState()
	      dispatch({
	          type: ANNOUNCE_CAPTURING_NEW_ISSUE,
	          issue_id_before: issue_id_before,
	          sprint_id: sprint_id
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

	      return impfetch(state, "imp/issue/", dispatch,
			                  {method: "POST",
			                   credentials: 'same-origin',
			                   data: data,
			                   headers: {"Content-type": "application/json; charset=UTF-8"},
			                   body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
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
	      return impfetch( state, "imp/issue/", dispatch,
			                   {method: "DELETE",
			                    credentials: 'same-origin',
			                    data: data,
			                    headers: {"Content-type": "application/json; charset=UTF-8"},
			                    body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
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

export function clock(issue_id, clock_action) {
    return (dispatch, getState) => {
	      const state = getState()
	      dispatch(announceDeletingIssue(issue_id))
	      let data = { issue_id: issue_id,
                     clock_action: clock_action }
	      return impfetch( state, "imp/issue/clock/", dispatch,
			                   {method: "POST",
			                    credentials: 'same-origin',
			                    data: data,
			                    headers: {"Content-type": "application/json; charset=UTF-8"},
			                    body: JSON.stringify(data)}
	      ).then(response => response.json())
	       .then(json => {
             if ( json.status !== 'success' ) {
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

export function getCandidateIssue(state) {
    const issue_objs = state.issue || {}
    return issue_objs.candidate_issue
}
