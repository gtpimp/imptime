import { impfetch } from './lib.js'
import { setDisplayMode, getDisplayMode } from './ItemList'
import { ENTITY_KEY__AUTO_CLOCK, CONTEXT_KEY__AUTO_CLOCK } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsPromise,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    getItemsById,
    itemPost
} from '../actions/Item'
import {
    select_issues,
    select_sprints,
    select_projects,
    get_selected_project_ids,
    get_selected_sprint_ids,
    get_selected_issue_ids
} from '../actions/Page'

export function invalidateAllAutoClocks() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__AUTO_CLOCK))
    }
}

export function invalidateAutoClocks(auto_clock_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__AUTO_CLOCK,
                                 auto_clock_ids_to_invalidate
        ))
    }
}

export function fetchAutoClocksIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__AUTO_CLOCK, list_key))
    }
}

export function ensureAutoClocksLoaded(auto_clock_ids) {
    return ensureItemsLoaded(ENTITY_KEY__AUTO_CLOCK, auto_clock_ids)
}

export function getAutoClock(state, auto_clock_id) {
    return getItem(state, ENTITY_KEY__AUTO_CLOCK, auto_clock_id)
}

export function getAutoClocks(state, auto_clock_ids) {
    return getItems(state, ENTITY_KEY__AUTO_CLOCK, auto_clock_ids)
}

export function getAutoClocksById(state, auto_clock_ids) {
    return getItemsById(state, ENTITY_KEY__AUTO_CLOCK, auto_clock_ids)
}

export function setAutoClockProjectAvailable(project_id) {
    return (dispatch, getState) => {
        const state = getState()
        const selected_project_ids = get_selected_project_ids(state, CONTEXT_KEY__AUTO_CLOCK) || []
        if ( project_id && selected_project_ids.length == 0 || selected_project_ids[0] != project_id  ) {
            dispatch(select_projects(CONTEXT_KEY__AUTO_CLOCK, [project_id]))
        }
    }
}

export function setAutoClockSprintAvailable(sprint_id) {
    return (dispatch, getState) => {
        const state = getState()
        const selected_sprint_ids = get_selected_sprint_ids(state, CONTEXT_KEY__AUTO_CLOCK) || []
        if ( sprint_id && selected_sprint_ids.length == 0 || selected_sprint_ids[0] != sprint_id  ) {
            dispatch(select_sprints(CONTEXT_KEY__AUTO_CLOCK, [sprint_id]))
        }
    }
}

export function setAutoClockIssueAvailable(issue_id) {
    return (dispatch, getState) => {
        const state = getState()
        const selected_issue_ids = get_selected_issue_ids(state, CONTEXT_KEY__AUTO_CLOCK) || []
        if ( issue_id && selected_issue_ids.length == 0 || selected_issue_ids[0] != issue_id  ) {
            dispatch(select_issues(CONTEXT_KEY__AUTO_CLOCK, [issue_id]))
        }
    }
}

export function getAvailableAutoClockEntity(state) {
    const selected_project_ids = get_selected_project_ids(state, CONTEXT_KEY__AUTO_CLOCK) || [undefined]
    const selected_sprint_ids = get_selected_sprint_ids(state, CONTEXT_KEY__AUTO_CLOCK) || [undefined]
    const selected_issue_ids = get_selected_issue_ids(state, CONTEXT_KEY__AUTO_CLOCK) || [undefined]
    return { available_project_id: selected_project_ids[0],
             available_sprint_id: selected_sprint_ids[0],
             available_issue_id: selected_issue_ids[0] }
}

export function clockIn(project_id, sprint_id, issue_id, role, description) {

    const url = "imp/clock/0/clockIn/"
    const field_name = "clockIn"
    const field_value = null
    const method = "POST"
    const data = { project_id: project_id,
                   sprint_id: sprint_id,
                   issue_id: issue_id,
                   role: role,
                   description: description }
    return itemPost(ENTITY_KEY__AUTO_CLOCK, [issue_id], url, field_name, field_value, method, data)
}

export function clockOut(entry_id) {

    const url = "imp/clock/0/clockOut/"
    const field_name = "clockOut"
    const field_value = null
    const method = "POST"
    const data = { entry_id: entry_id }
    return itemPost(ENTITY_KEY__AUTO_CLOCK, [entry_id], url, field_name, field_value, method, data)
}
