import { impfetch } from './lib.js'
import { updateVisibleItemIdAbove } from './ItemList'
import { get } from 'lodash'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    updateItem,
    startCandidateItem,
    saveCandidateItem,
    updateCandidateDetails,
    cancelCandidateItem,
    getCandidateItem,
    deleteItems,
    is_item_invalidated,
    getInvalidatedItemIds,
    getSavingItemIds,
    getLoadingItemIds
} from '../actions/Item'

import {
    ENTITY_KEY__SPRINT,
    small_col_width,
    medium_col_width,
    large_col_width
} from './ItemListKeyRegistry'

export const ANNOUNCE_CLONING_SPRINT = 'ANNOUNCE_CLONING_SPRINT'
export const ANNOUNCE_CLONED_SPRINT = 'ANNOUNCE_CLONED_SPRINT'
export const ANNOUNCE_CLONE_SPRINT_FAILED = 'ANNOUNCE_CLONE_SPRINT_FAILED'
export const SET_LAST_SELECTED_SPRINT = 'SET_LAST_SELECTED_SPRINT'

export const ALL_AVAILABLE_SPRINT_HEADERS =
    [ {key:'name', label:'name', description:'Name', width:large_col_width, is_default:true},
      {key:'ref', label:'Ref', description:'Reference', width:small_col_width, is_default:true},
      {key:'number', label:'number', description:'Number', width:small_col_width},
      {key:'state_summary', label:'State Summary', description:'State summary indicating problems', width:large_col_width, is_default:true},
      {key:'start_time', label:"First clock", description:"First clocked time on this sprint", width:small_col_width},
      {key:'end_time', label:"Last clock", description:"Last clocked time on this sprint", width:small_col_width},
      {key:'num_issues', label:"Issues", description:"Number of issues", width: small_col_width, is_default:true},
      {key:'num_testable_issues', label:"Testable issues", description:"Number of testable issues", width: small_col_width},
      {key:'has_dev_started', label:"Has dev started", description:"Has time been clocked by the assigned user on any testable issue", width:small_col_width},
      {key:'status', label:"Status", description:"Sprint status", width:small_col_width, is_default:true},
      {key:'type', label:"Type", description:"Sprint type", width:small_col_width},
      {key:'hours_by_assignee', label:"Total clocked hours by assignee", description:"Total actual hours by the assigned user across all testable issues", width:small_col_width},
      {key:'estimates_by_assignee', label:"Total estimated hours by assignee", description:"Total estimated hours by the assigned user across all testable issues", width:small_col_width},
      {key:'open_estimates_by_assignee', label:"Total open estimated hours by assignee", description:"Total estimated hours by the assigned user across open testable issues", width:small_col_width},
    ]

export const ALL_AVAILABLE_SPRINT_PROPOSAL_HEADERS = [
    {key:'number', label:'Number', description:'Number', width:small_col_width, is_default:true},
    {key:'name', label:'Name', description:'Name', width:"auto", flex:1, is_default:true},
    {key:'estimates_by_assignee', label:"Hours", description:"Total estimated hours by the assigned user", width:small_col_width, is_default:true},
    {key:'cost_by_assignee', label:"Cost", description:"Total estimated cost by the assigned user", width:small_col_width, is_default:true},
    {key:'assignee', label:"Assignee", description:"Issue assignee", width:medium_col_width},
]

export function invalidateAllSprints() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__SPRINT))
    }
}

export function invalidateSprints(sprint_ids) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__SPRINT, sprint_ids
        ))
    }
}

export function fetchSprintsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__SPRINT, list_key))
    }
}

export function ensureSprintsLoaded(sprint_ids) {
    return ensureItemsLoaded(ENTITY_KEY__SPRINT, sprint_ids)
}

export function getSprint(state, sprint_id) {
    return getItem(state, ENTITY_KEY__SPRINT, sprint_id)
}

export function getSprints(state, sprint_ids) {
    return getItems(state, ENTITY_KEY__SPRINT, sprint_ids)
}

export function updateSprintName(sprint_id, value) {
    return updateItem(ENTITY_KEY__SPRINT, [sprint_id], "name", value)
}

export function updateSprintDescription(sprint_id, value) {
    return updateItem(ENTITY_KEY__SPRINT, [sprint_id], "description", value)
}

export function updateSprintStatus(sprint_id, value) {
    return updateItem(ENTITY_KEY__SPRINT, [sprint_id], "status_name", value)
}

export function updateSprintType(sprint_id, value) {
    return updateItem(ENTITY_KEY__SPRINT, [sprint_id], "sprint_type", value)
}

export function updateSprintReviewCycle(sprint_id, value) {
    return updateItem(ENTITY_KEY__SPRINT, [sprint_id], "review_cycle_days", value)
}

export function updateSprintCommission(sprint_id, value) {
    return updateItem(ENTITY_KEY__SPRINT, [sprint_id], "commission_percentage", value)
}

export function updateSprintRatios(sprint_id, value) {
    return updateItem(ENTITY_KEY__SPRINT, [sprint_id], "ratios", value)
}

export function updateSprintBudget(sprint_id, value) {
    return updateItem(ENTITY_KEY__SPRINT, [sprint_id], "budget", value)
}


export function startCandidateSprint() {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__SPRINT, {}))
    }
}

export function updateCandidateName(name) {
    return updateCandidateDetails(ENTITY_KEY__SPRINT, {name:name})
}

export function cancelCandidateSprint() {
    return cancelCandidateItem(ENTITY_KEY__SPRINT)
}

export function saveCandidateSprint(on_done) {
    return saveCandidateItem(ENTITY_KEY__SPRINT, on_done)
}

export function getCandidateSprint(state) {
    return getCandidateItem(ENTITY_KEY__SPRINT, state)
}

export function getInvalidatedSprintIds(state, sprint_ids) {
    return getInvalidatedItemIds(ENTITY_KEY__SPRINT, state, sprint_ids)
}

export function getLoadingSprintIds(state, sprint_ids) {
    return getLoadingItemIds(state, ENTITY_KEY__SPRINT, sprint_ids)
}

export function getSavingSprintIds(state, sprint_ids) {
    return getSavingItemIds(ENTITY_KEY__SPRINT, state, sprint_ids)
}

export function is_sprint_invalidated(state, sprint_id) {
    return is_item_invalidated(ENTITY_KEY__SPRINT, state, sprint_id)
}

export function deleteSprints(sprint_ids) {
    return deleteItems(ENTITY_KEY__SPRINT, sprint_ids)
}


export function reorderSprints(sprints, index_of_row_being_moved, original_index_of_destination, list_key ) {
    return (dispatch, getState) => {

        let index_of_destination = original_index_of_destination

        if ( index_of_row_being_moved > index_of_destination ) {
            index_of_destination -= 1;
        }

        const sprint_id_before = sprints[index_of_row_being_moved].id
        const sprint_id_after = (index_of_destination>=0 && sprints[index_of_destination].id) || null
        
        dispatch(updateVisibleItemIdAbove(list_key, [sprint_id_before], sprint_id_after, original_index_of_destination))
        dispatch(updateItem(ENTITY_KEY__SPRINT, [sprint_id_before], "sprint_id_after", sprint_id_after))
    }
}

export function announceCloneSprintFailed(sprint_id, error) {
    return {
        type: ANNOUNCE_CLONE_SPRINT_FAILED,
        sprint_id: sprint_id,
        error: error
    }
}

export function announceCloningSprint(sprint_id) {
    return {
        type: ANNOUNCE_CLONING_SPRINT,
        sprint_id: sprint_id
    }
}

export function announceClonedSprint(sprint_id, payload) {
    return {
        type: ANNOUNCE_CLONED_SPRINT,
        sprint_id: sprint_id,
        new_sprint_id: payload.new_sprint_id
    }
}

export function cloneTemplateSprint(sprint_id, onDone) {

    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceCloningSprint(sprint_id))
	let data = {}

	return impfetch(state, "imp/sprint/" + sprint_id + "/clone/", dispatch,
			{method: "POST",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"},
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceCloneSprintFailed(sprint_id, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceClonedSprint(sprint_id, json.payload))
                 if ( onDone ) {
                     onDone(json.payload.new_sprint_id)
                 }
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceCloneSprintFailed(sprint_id, error))
	 })
    }
}

export function getExecutiveSummaryUrl(project_id, sprint_id) {
    return window.location.origin + `/wd/projects/${project_id}/sprints/${sprint_id}/executive_summary`
}

export function setLastSelectedSprintId(sprint_id) {
    return {
        type: SET_LAST_SELECTED_SPRINT,
        sprint_id: sprint_id
    }
}

export function getLastSelectedSprintId(state) {
    return get(state, ["sprint", "last_selected_sprint_id"], null)
}


