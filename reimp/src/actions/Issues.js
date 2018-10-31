import { impfetch } from './lib.js'

import { updateVisibleItemIdAbove, setItemFlag } from './ItemList'
import {
    ENTITY_KEY__ISSUE,
    ENTITY_KEY__TAG,
    medium_col_width,
    small_col_width,
    tiny_col_width,
} from './ItemListKeyRegistry'

import { map, compact, forEach, filter, includes } from 'lodash'
import difference from 'lodash/difference'
import { getUser } from '../actions/Users'
import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    getItemsById,
    getItemByRef,
    updateItem,
    startCandidateItem,
    saveCandidateItem,
    updateCandidateDetails,
    cancelCandidateItem,
    getCandidateItem,
    deleteItems,
    itemPost,
    is_item_invalidated,
    getInvalidatedItemIds,
    getSavingItemIds,
    getLoadingItemIds
} from '../actions/Item'

export const SET_ISSUE_STORE_VALUE = 'SET_ISSUE_STORE_VALUE'
export const ANNOUNCE_BULK_CREATING_ISSUES = 'ANNOUNCE_BULK_CREATING_ISSUES'
export const ANNOUNCE_BULK_CREATING_ISSUES_FAILED = 'ANNOUNCE_BULK_CREATING_ISSUES_FAILED'
export const ANNOUNCE_BULK_CREATED_ISSUES = 'ANNOUNCE_BULK_CREATED_ISSUES'

export const ALL_AVAILABLE_ISSUE_HEADERS = [ {key:'number', label:"#", description:"Issue number", width:"50px", is_default:true},
                                             {key:'issue_type', label:'', description:"Icon showing the issue type", width:tiny_col_width, is_default:true},
                                             {key:'attachment', label:'', description:"Icon showing if the issue has an attachment", width:tiny_col_width, is_default:true},
                                             {key:'problems', label:'', description:"Icon showing if the issue has problems", width:tiny_col_width, is_default:true},
                                             {key:'expand_feature', label:'', description:"Icon to allow expanding feature issues", width:tiny_col_width},
                                             {key:'name', label:"Name", description:"Issue subject", width:"auto", flex:1, is_default:true},
                                             {key:'assignee', label:"Assignee", description:"Issue assignee", width:medium_col_width, is_default:true},
                                             {key:'created_at', label:"Created at", description:"Creation date", width:medium_col_width},
                                             {key:'status', label:"Status", description:"Status",  width:medium_col_width, is_default:true},
                                             {key:'tag_columns', label:"Tag Columns", description:"Columns for each tag", width:medium_col_width, is_default:true},
                                             {key:'my_estimate', label:"My Estimate", description:"My time estimate", width:small_col_width},
                                             {key:'estimate_summary', label:"Time", description:"Condensed summary of all times", width:medium_col_width, is_default:true},
                                             {key:'estimate_columns', label:"Estimates", description:"Columns for each user", width:medium_col_width},
                                             {key:'small_delete', label:"", description:"Delete issue", width:tiny_col_width},
                                             {key:'view_in_sprint', label:"", description:"View in sprint", width:tiny_col_width},
]


const DEFAULT_POPUP_ISSUE_HEADER_KEYS = ["name", "view_in_sprint", "status"]
export const ALL_AVAILABLE_POPUP_ISSUE_HEADERS = filter(ALL_AVAILABLE_ISSUE_HEADERS, (header) => includes(DEFAULT_POPUP_ISSUE_HEADER_KEYS, header.key))

export function invalidateAllIssues() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__ISSUE))
    }
}

export function invalidateIssues(issue_ids) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__ISSUE, issue_ids
        ))
    }
}

export function fetchIssuesIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__ISSUE, list_key))
    }
}

export function ensureIssuesLoadedByRef(ref, comment_ref) {
    const additional_get_args = {'ref':ref,
                                 'comment_ref': comment_ref,
                                 'url_suffix': '_share'}
    const fake_issue_id = -1
    return ensureItemsLoaded(ENTITY_KEY__ISSUE, [fake_issue_id], additional_get_args)
}

export function ensureIssuesLoaded(issue_ids) {
    return ensureItemsLoaded(ENTITY_KEY__ISSUE, issue_ids)
}

export function getIssueByRef(state, ref) {
    return getItemByRef(state, ENTITY_KEY__ISSUE, ref)
}

export function getIssue(state, issue_id) {
    return getItem(state, ENTITY_KEY__ISSUE, issue_id)
}

export function getIssues(state, issue_ids) {
    return getItems(state, ENTITY_KEY__ISSUE, issue_ids)
}

export function getIssuesById(state, issue_ids) {
    return getItemsById(state, ENTITY_KEY__ISSUE, issue_ids)
}

export function populateEstimates(state, issue) {
    map(issue.all_estimates, function (estimate) {
        estimate.user = getUser(state, estimate.user_id)
    })
}

export function updateIssueSubject(issue_id, value) {
    return updateItem(ENTITY_KEY__ISSUE, [issue_id], "subject", value)
}

export function updateIssueStatus(issue_ids, value) {
    return updateItem(ENTITY_KEY__ISSUE, issue_ids, "status_name", value)
}

export function updateIssueType(issue_ids, value) {
    return updateItem(ENTITY_KEY__ISSUE, issue_ids, "type_name", value)
}

export function updateIssueDueDate(issue_ids, value) {
    return updateItem(ENTITY_KEY__ISSUE, issue_ids, "due_date", value)
}

export function updateIssueRisky(issue_ids, value) {
    return updateItem(ENTITY_KEY__ISSUE, issue_ids, "risky", value)
}

export function updateIssueFeature(issue_ids, value) {
    return updateItem(ENTITY_KEY__ISSUE, issue_ids, "feature_name", value)
}

export function updateIssueDescription(issue_id, value) {
    return updateItem(ENTITY_KEY__ISSUE, [issue_id], "description", value)
}

export function updateIssueAssignedTo(issue_ids, value) {
    return updateItem(ENTITY_KEY__ISSUE, issue_ids, "assigned_to_id", value)
}

export function updateIssueToggleAsFeature(issue_ids, value) {
    // value can be true to make a feature, false to un-make as feature, of 'toggle' to toggle
    return updateItem(ENTITY_KEY__ISSUE, issue_ids, "can_group_issues", value)
}

export function reviewNow(issue_ids, value) {
    return updateItem(ENTITY_KEY__ISSUE, issue_ids, "review_now", value)
}

export function updateIssueEstimate(issue_ids, value) {
    return updateItem(ENTITY_KEY__ISSUE, issue_ids, "my_estimate", value)
}

export function moveIssuesToSprint(issue_ids, new_sprint_id) {
    return updateItem(ENTITY_KEY__ISSUE, issue_ids, "sprint_id", new_sprint_id)
}

export function copyIssuesToSprint(issue_ids, new_sprint_id) {
    return updateItem(ENTITY_KEY__ISSUE, issue_ids, 'copy_sprint_id', new_sprint_id)
}

export function groupIssuesIntoFeature(children_issue_ids, feature_issue_id) {
    return updateItem(ENTITY_KEY__ISSUE, children_issue_ids, "parent_group_id", feature_issue_id)
}

export function makeFeatureIssuesSuccessive(feature_issue_id, sprint_id) {
    return updateItem(ENTITY_KEY__ISSUE, [feature_issue_id], "make_feature_issues_successive", sprint_id)
}

export function updateIssueComment(issue_id, comment_id, new_comment) {
    const url = "imp/issue/comment/0/"
    const field_name = "comment"
    const field_value = new_comment
    const method = "PUT"
    const data = { issue_id: issue_id,
                   comment_id: comment_id,
                   comment: new_comment }
    return itemPost(ENTITY_KEY__ISSUE, [issue_id], url, field_name, field_value, method, data)
}

export function createIssueComment(issue_id, new_comment) {
    const url = "imp/issue/comment/"
    const field_name = "comment"
    const field_value = new_comment
    const method = "POST"
    const data = { issue_id: issue_id,
                   comment: new_comment }
    return itemPost(ENTITY_KEY__ISSUE, [issue_id], url, field_name, field_value, method, data)
}

export function deleteIssueComment(issue_id, comment_id) {
    const url = "imp/issue/comment/0/"
    const field_name = "comment"
    const field_value = "deleting"
    const method = "DELETE"
    const data = { issue_id: issue_id,
                   comment_id: comment_id }
    return itemPost(ENTITY_KEY__ISSUE, [issue_id], url, field_name, field_value, method, data)
}

export function updateIssueTestable(issue_id, testable_id, new_testable, name) {
    const url = "imp/issue/testable/0/"
    const field_name = "testable"
    const field_value = new_testable
    const method = "PUT"
    const data = { issue_id: issue_id,
                   testable_id: testable_id,
                   name: name,
                   testable: new_testable }
    return itemPost(ENTITY_KEY__ISSUE, [issue_id], url, field_name, field_value, method, data)
}

export function createIssueTestable(issue_id, new_testable, name) {
    const url = "imp/issue/testable/"
    const field_name = "testable"
    const field_value = new_testable
    const method = "POST"
    const data = { issue_id: issue_id,
                   name: name,
                   testable: new_testable }
    return itemPost(ENTITY_KEY__ISSUE, [issue_id], url, field_name, field_value, method, data)
}

export function deleteIssueTestable(issue_id, testable_id) {
    const url = "imp/issue/testable/0/"
    const field_name = "testable"
    const field_value = testable_id
    const method = "DELETE"
    const data = { issue_id: issue_id,
                   testable_id: testable_id }
    return itemPost(ENTITY_KEY__ISSUE, [issue_id], url, field_name, field_value, method, data)
}

export function deleteIssueAttachment(issue_id, attachment_id) {
    const url = "imp/issue/attachment/"+attachment_id+"/"
    const field_name = "attachment"
    const field_value = "deleting"
    const method = "DELETE"
    const data = { issue_id: issue_id }
    return itemPost(ENTITY_KEY__ISSUE, [issue_id], url, field_name, field_value, method, data)
}

export function groupUnsortedIssuesIntoFeature(issue_ids) {

    return (dispatch, getState) => {
        const state = getState()
        if (issue_ids.length === 1) {
            alert("Please select a single feature issue and at least one other issue to group together")
            return
        }
        let feature_issue = null
        let ok_to_group = true
        const issues = getIssues(state, compact(issue_ids))
        map(issues, function (issue) {
            if (issue.can_group_issues) {
                if (feature_issue && issue.id !== feature_issue.id) {
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
        dispatch(updateItem(ENTITY_KEY__ISSUE, issue_ids, "parent_group_id", null))
    }
}

export function addEstimate(issue_ids, estimate_hours, on_done) {
    const url = "imp/issue/estimate/"
    const field_name = "estimate_hours"
    const field_value = estimate_hours
    const method = "POST"
    const data = { issue_id: issue_ids,
                   estimate_hours: estimate_hours }
    return itemPost(ENTITY_KEY__ISSUE, issue_ids, url, field_name, field_value, method, data, on_done)
}

export function setIssueStoreValue(issue_ids, field_name, new_value) {
    return {
        type: SET_ISSUE_STORE_VALUE,
        issue_ids: issue_ids,
        field_name: field_name,
        new_value: new_value
    }
}

export function reorderIssue(moving_issue_ids, issue_id_after, list_key, index_of_destination, on_done) {
    return (dispatch, getState) => {
        dispatch(updateVisibleItemIdAbove(list_key, moving_issue_ids, issue_id_after, index_of_destination))
        dispatch(updateItem(ENTITY_KEY__ISSUE, moving_issue_ids, "issue_id_after", issue_id_after, on_done))
    }
}

export function startCandidateIssue(sprint_id, issue_id_before, selected_issue_ids) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__ISSUE,
                                    { issue_id_before: issue_id_before,
	                                    sprint_id: sprint_id,
                                      selected_issue_ids: selected_issue_ids || [issue_id_before] }))
    }
}

export function startCandidateFeature(sprint_id, issue_id_before) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__ISSUE,
                                    { issue_id_before: issue_id_before,
	                                    sprint_id: sprint_id,
                                      can_group_issues: true }))
    }
}

function getParents(issues) {
    const parent_issue_ids = []
    forEach(issues, function(issue) {
        if((issue.parent_group_id === null) && (issue.group_children.length !== 0)) {
            parent_issue_ids.push(issue.id)
        }
    })
    return parent_issue_ids
}

export function collapseAllFeatures(issues) {
    const parents = getParents(issues)
    return (dispatch, getState) => {
        dispatch(setItemFlag('issues', parents, 'expanded_issues', false))
    }
}

export function expandAllFeatures(issues) {
    const parents = getParents(issues)
    return (dispatch, getState) => {
        dispatch(setItemFlag('issues', parents, 'expanded_issues', true))
    }
}

export function updateCandidateSubject(subject) {
    return updateCandidateDetails(ENTITY_KEY__ISSUE, {subject:subject})
}

export function updateCandidateSprint(sprint_id) {
    return updateCandidateDetails(ENTITY_KEY__ISSUE, {sprint_id:sprint_id})
}

export function updateCandidateProperties(props) {
    return updateCandidateDetails(ENTITY_KEY__ISSUE, props)
}

export function cancelCandidateIssue() {
    return cancelCandidateItem(ENTITY_KEY__ISSUE)
}

export function saveCandidateIssue(on_done) {
    return saveCandidateItem(ENTITY_KEY__ISSUE, on_done)
}

export function deleteIssues(issue_ids) {
    return deleteItems(ENTITY_KEY__ISSUE, issue_ids)
}

export function clock(issue_id, clock_action) {
    const url = "imp/issue/clock/"
    const field_name = "clock"
    const field_value = clock_action
    const method = "POST"
    const data = { issue_id: issue_id,
                   clock_action: clock_action }
    return itemPost(ENTITY_KEY__ISSUE, [issue_id], url, field_name, field_value, method, data)
}

export function getCandidateIssue(state) {
    return getCandidateItem(ENTITY_KEY__ISSUE, state)
}

export function getInvalidatedIssueIds(state, issue_ids) {
    return getInvalidatedItemIds(ENTITY_KEY__ISSUE, state, issue_ids)
}

export function getLoadingIssueIds(state, issue_ids) {
    return getLoadingItemIds(state, ENTITY_KEY__ISSUE, issue_ids)
}

export function getSavingIssueIds(state, issue_ids) {
    return getSavingItemIds(ENTITY_KEY__ISSUE, state, issue_ids)
}

export function is_issue_invalidated(state, issue_id) {
    return is_item_invalidated(ENTITY_KEY__ISSUE, state, issue_id)
}


function announceBulkCreatingIssues(sprint_id) {
    return {
        type: ANNOUNCE_BULK_CREATING_ISSUES,
        sprint_id: sprint_id
    }
}

function announceBulkCreatedIssues(sprint_id, new_issue_ids) {
    return {
        type: ANNOUNCE_BULK_CREATED_ISSUES,
        sprint_id: sprint_id,
        new_issue_ids: new_issue_ids
    }
}

function announceBulkCreatingIssuesFailed(sprint_id, error) {
    return {
        type: ANNOUNCE_BULK_CREATING_ISSUES_FAILED,
        sprint_id: sprint_id,
        error: error
    }
}

export function bulkCreateIssues(sprint_id, bulk_issue_text, on_done) {
    return (dispatch, getState) => {
        const state = getState()
        dispatch(announceBulkCreatingIssues(sprint_id))
        let data = { sprint_id: sprint_id,
                     bulk_issue_text: bulk_issue_text }
        return impfetch( state, "imp/issue/bulk_create_issues/", dispatch,
                         {method: "POST",
                          credentials: 'same-origin',
                          data: data,
                          headers: {"Content-type": "application/json; charset=UTF-8"},
                          body: JSON.stringify(data)}
        ).then(response => response.json())
         .then(json => {
             if ( json.status !== 'success' ) {
                 console.log('Request failed with JSON response', json);
                 dispatch(announceBulkCreatingIssuesFailed(sprint_id, json.error))
             } else {
                 console.log('Request succeeded with JSON response', json);
                 dispatch(announceBulkCreatedIssues(sprint_id, json.payload.new_issues_ids))
                 if ( on_done ) {
                     on_done(json.payload.new_issue_ids)
                 }
             }
         })
         .catch(function (error) {
             console.log('Request failed', error);
             dispatch(announceBulkCreatingIssuesFailed(sprint_id, error))
         })
    }
}

export function promoteIssueTestableToIssue(issue_id, testable_id, on_done) {
    const url = "imp/issue/testable/" + testable_id + "/promoteToIssue/"
    const field_name = "testable_promotion"
    const field_value = testable_id
    const method = "POST"
    const data = {}
    return itemPost(ENTITY_KEY__ISSUE, [issue_id], url, field_name, field_value, method, data, on_done)
}

export function addOrEditIssueTag(tag_name, tag_category_name, issue_ids, tag_id) {
    const url = "imp/" + ENTITY_KEY__TAG + "/add_to_issue/"
    const field_name = "tags"
    const field_value = tag_name
    const method = "PUT"
    const data = { issue_ids: issue_ids,
                   tag_id: tag_id || null,
                   tag_name: tag_name,
                   tag_category_name: tag_category_name }
    return itemPost(ENTITY_KEY__ISSUE, issue_ids, url, field_name, field_value, method, data)
}

export function deleteTagFromIssues(tag_id, issue_ids) {
    const url = "imp/" + ENTITY_KEY__TAG + "/" + tag_id + "/remove_from_issues/"
    const field_name = "tags"
    const field_value = tag_id
    const method = "DELETE"
    const data = { issue_ids: issue_ids }
    return itemPost(ENTITY_KEY__ISSUE, issue_ids, url, field_name, field_value, method, data)
}

export function addIssueNeedsAnother(issue_id, needs_issue_id) {
    const url = "imp/" + ENTITY_KEY__ISSUE + "/add_needs_issue/"
    const field_name = "dependancy"
    const field_value = issue_id
    const method = "POST"
    const data = { issue_id: issue_id, needs_issue_id: needs_issue_id }
    return itemPost(ENTITY_KEY__ISSUE, [issue_id], url, field_name, field_value, method, data)
}

export function removeIssueNeedsAnother(issue_id, needs_issue_id) {
    const url = "imp/" + ENTITY_KEY__ISSUE + "/remove_needs_issue/"
    const field_name = "dependancy"
    const field_value = issue_id
    const method = "POST"
    const data = { issue_id: issue_id, needs_issue_id: needs_issue_id }
    return itemPost(ENTITY_KEY__ISSUE, [issue_id], url, field_name, field_value, method, data)
}

export function generateReadOnlyIssueCommentLink(issue_id, comment_id) {
    const url = "imp/" + ENTITY_KEY__ISSUE + "/gen_readonly_comment_link/"
    const field_name = "readonly_comment_link"
    const field_value = issue_id
    const method = "POST"
    const data = { issue_id: issue_id, comment_id: comment_id }
    return itemPost(ENTITY_KEY__ISSUE, [issue_id], url, field_name, field_value, method, data)
}

export function startMinutesEditor(project_id, on_done) {
    const url = "imp/" + ENTITY_KEY__ISSUE + "/open_minutes/"
    const field_name = "project_minutes"
    const field_value = project_id
    const method = "POST"
    const data = { project_id: project_id }

    const on_post_done = function(json) {
        const issue = json.payload.item
        on_done(issue)
    }
    
    return itemPost(ENTITY_KEY__ISSUE, ["minutes_for_"+project_id], url,
                    field_name, field_value, method, data, on_post_done)
}
