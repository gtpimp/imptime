import cookie from 'react-cookies';
import { ENTITY_KEY__AUTO_CLOCK, CONTEXT_KEY__AUTO_CLOCK } from '../actions/ItemListKeyRegistry'
import { get } from 'lodash'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    getItemsById,
    itemPost,
    setGlobalEntityFlag,
    getGlobalEntityFlag,
    startCandidateItem,
    saveCandidateItem
} from '../actions/Item'
import {
    getPageSelectedEntities
} from '../actions/Page'

export function hideAutoClockPopup() {
    cookie.save('show_auto_clock_popup', "0", { path: '/' })
}

export function showAutoClockPopup() {
    cookie.save('show_auto_clock_popup', "1", { path: '/' })
}

export function enableAutoClocking() {
    cookie.save('auto_clocking', "1", { path: '/' })
    return setGlobalEntityFlag(ENTITY_KEY__AUTO_CLOCK, 'auto_clocking', true)
}

export function disableAutoClocking() {
    cookie.save('auto_clocking', "0", { path: '/' })
    return setGlobalEntityFlag(ENTITY_KEY__AUTO_CLOCK, 'auto_clocking', false)
}

export function isAutoClockingEnabled(state) {
    let enabled = getGlobalEntityFlag(state, "auto_clocking")
    if ( enabled === undefined ) {
        enabled = cookie.load('auto_clocking') === "1"
        if ( enabled ) {
            enableAutoClocking()
        } else {
            disableAutoClocking()
        }
    }
    return enabled
}

export function createHistoricClockEntry(data, on_done) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__AUTO_CLOCK, data))
        dispatch(saveCandidateItem(ENTITY_KEY__AUTO_CLOCK, on_done))
    }
}

export function getPreferredRole() {
    return cookie.load('auto_clock_referred_role') || null
}

export function setPreferredRole(role_name) {
    return cookie.save('auto_clock_referred_role', role_name, { path: '/' })
}

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

export function getNumUnallocatedEntries(state) {
    // return get(state, ["item", ENTITY_KEY__AUTO_CLOCK, 
}

export function setActivelyAvailableAutoClockEntity(project_id, sprint_id, issue_id) {
    return (dispatch, getState) => {
        const state = getState()
        if ( isAutoClockingEnabled(state) && project_id ) {
            dispatch(clockIn({project_id:project_id,
                              sprint_id: sprint_id,
                              issue_id: issue_id}))
        }
    }
}

export function getAvailableAutoClockEntity(state) {
    const selected_project_ids = get(getPageSelectedEntities(state, CONTEXT_KEY__AUTO_CLOCK), ["project_ids"], [undefined])
    const selected_sprint_ids = get(getPageSelectedEntities(state, CONTEXT_KEY__AUTO_CLOCK), ["sprint_ids"], [undefined])
    const selected_issue_ids = get(getPageSelectedEntities(state, CONTEXT_KEY__AUTO_CLOCK), ["issue_ids"], [undefined])
    return { available_project_id: get(selected_project_ids, [0]),
             available_sprint_id: get(selected_sprint_ids, [0]),
             available_issue_id: get(selected_issue_ids, [0]) }
}

export function clockIn(data) {
    // data contains one or more of: 
    // project_id, sprint_id, issue_id, project_name, action, description
    
    const url = "imp/clock/0/clockIn/"
    const field_name = "clockIn"
    const field_value = null
    const method = "POST"
    return itemPost(ENTITY_KEY__AUTO_CLOCK, [data.issue_id], url, field_name, field_value, method, data)
}

export function clockOut(entry_id) {

    const url = "imp/clock/0/clockOut/"
    const field_name = "clockOut"
    const field_value = null
    const method = "POST"
    const data = { entry_id: entry_id }
    return itemPost(ENTITY_KEY__AUTO_CLOCK, [entry_id], url, field_name, field_value, method, data)
}

export function deleteAutoClocks(clock_ids) {
    // Hack: not sure why base function Delete isn't working, something with the api perhaps?
    
    const url = "imp/clock/0/delete/"
    const field_name = "delete"
    const field_value = null
    const method = "DELETE"
    const data = { item_ids: clock_ids }
    return itemPost(ENTITY_KEY__AUTO_CLOCK, [clock_ids[0]], url, field_name, field_value, method, data)
}

export function updateAutoClocks(clock_ids, data) {
    // data can contain any of: role_name, description, start_time, end_time, issue_id

    const url = "imp/clock/0/adjust/"
    const field_name = "clockUpdate"
    const field_value = null
    const method = "PUT"
    data['clock_ids'] = clock_ids
    return itemPost(ENTITY_KEY__AUTO_CLOCK, clock_ids, url, field_name, field_value, method, data)
}

