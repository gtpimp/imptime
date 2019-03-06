import { ENTITY_KEY__PROJECT, small_col_width } from '../actions/ItemListKeyRegistry'
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
    itemPost,
    is_item_invalidated,
    getInvalidatedItemIds,
    getSavingItemIds,
    getLoadingItemIds
} from '../actions/Item'


export const SET_LAST_SELECTED_PROJECT = 'SET_LAST_SELECTED_PROJECT'

export const ALL_AVAILABLE_PROJECT_RECON_HEADERS = [
    {key:'estimates_by_assignee', label:"Estimated hours", description:"Total estimated hours by the assigned user", width:small_col_width, is_default:true},
    {key:'estimated_cost_by_assignee', label:"Estimated cost", description:"Total estimated cost by the assigned user", width:small_col_width, is_default:true},
    {key:'actual_hours_by_user', label:"Actual hours by user", description:"Total actual hours by each users clocked against this issue", width:small_col_width, is_default:true},
    {key:'actual_cost', label:"Actual cost", description:"Total actual cost by all users clocked against this issue", width:small_col_width, is_default:true},
    {key:'actual_cost_by_user', label:"Actual cost by user", description:"Total actual cost by each user clocked against this issue", width:small_col_width, is_default:true},
]

export function invalidateAllProjects() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__PROJECT))
    }
}

export function invalidateProjects(project_ids) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__PROJECT, project_ids
        ))
    }
}

export function fetchProjectsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__PROJECT, list_key))
    }
}

export function ensureProjectsLoaded(project_ids) {
    return ensureItemsLoaded(ENTITY_KEY__PROJECT, project_ids)
}

export function getProject(state, project_id) {
    return getItem(state, ENTITY_KEY__PROJECT, project_id)
}

export function getProjects(state, project_ids) {
    return getItems(state, ENTITY_KEY__PROJECT, project_ids)
}

export function updateProjectName(project_id, value) {
    return updateItem(ENTITY_KEY__PROJECT, [project_id], "name", value)
}

export function updateProjectDescription(project_id, value) {
    return updateItem(ENTITY_KEY__PROJECT, [project_id], "description", value)
}

export function startCandidateProject() {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__PROJECT, {}))
    }
}

export function updateCandidateName(name) {
    return updateCandidateDetails(ENTITY_KEY__PROJECT, {name:name})
}

export function cancelCandidateProject() {
    return cancelCandidateItem(ENTITY_KEY__PROJECT)
}

export function saveCandidateProject(on_done) {
    return saveCandidateItem(ENTITY_KEY__PROJECT, on_done)
}

export function getCandidateProject(state) {
    return getCandidateItem(ENTITY_KEY__PROJECT, state)
}

export function getInvalidatedProjectIds(state, project_ids) {
    return getInvalidatedItemIds(ENTITY_KEY__PROJECT, state, project_ids)
}

export function getLoadingProjectIds(state, project_ids) {
    return getLoadingItemIds(state, ENTITY_KEY__PROJECT, project_ids)
}

export function getSavingProjectIds(state, project_ids) {
    return getSavingItemIds(ENTITY_KEY__PROJECT, state, project_ids)
}

export function is_project_invalidated(state, project_id) {
    return is_item_invalidated(ENTITY_KEY__PROJECT, state, project_id)
}

export function deleteProjects(project_ids) {
    return deleteItems(ENTITY_KEY__PROJECT, project_ids)
}

export function saveInviteUser(project_id, user_email) {
    const url = `imp/project/${project_id}/invite/`
    const field_name = "project_id"
    const field_value = project_id
    const method = "POST"
    const data = { project_id: project_id }
    return itemPost(ENTITY_KEY__PROJECT, [project_id], url, field_name, field_value, method, data)
}

export function canShowProjectDelete(project) {
    return (project && project.can_delete_project) || false
}

export function setLastSelectedProjectId(project_id) {
    return {
        type: SET_LAST_SELECTED_PROJECT,
        project_id: project_id
    }
}

export function getLastSelectedProjectId(state) {
    return get(state, ["project", "last_selected_project_id"], null)
}
