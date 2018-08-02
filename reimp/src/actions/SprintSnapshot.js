import { get, keys, includes } from 'lodash'
import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    getAllItems,
    getItemsById,
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
import { has_permission } from './Users'
import { ENTITY_KEY__SPRINT_SNAPSHOT } from './ItemListKeyRegistry'

export const SET_SPRINT_SNAPSHOT_BUTTON = 'SET_SPRINT_SNAPSHOT_BUTTON'
export const SET_SPRINT_SNAPSHOT = 'SET_SPRINT_SNAPSHOT'
export const START_SPRINT_SNAPSHOT_CONFIGURER = 'START_SPRINT_SNAPSHOT_CONFIGURER'
export const STOP_SPRINT_SNAPSHOT_CONFIGURER = 'STOP_SPRINT_SNAPSHOT_CONFIGURER'

export function showMoney(state, project_id) {
    // Because money comes up a lot, this is a helper function.
    // If this function returns True, it's absolutely ok to show money.
    // If this function returns False, do not under any circumstances show money.
    return doesSprintSnapshotHaveFeature(state, 'costs') && project_id && has_permission(state, project_id, 'has_view_ctc_billable_rates')
}

export function getHeaderListForSprintSnapshot(snapshot, name) {
    return get(snapshot, ["headers", name], null)
}

export function getHeaderListForCurrentSprintSnapshot(state, name) {
    const snapshot = getCurrentSprintSnapshot(state)
    return getHeaderListForSprintSnapshot(snapshot, name)
}

export function invalidateAllSprintSnapshots() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__SPRINT_SNAPSHOT))
    }
}

export function invalidateSprintSnapshots(snapshot_ids) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__SPRINT_SNAPSHOT, snapshot_ids
        ))
    }
}

export function fetchSprintSnapshotsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__SPRINT_SNAPSHOT, list_key))
    }
}

export function ensureSprintSnapshotsLoaded(snapshot_ids) {
    return ensureItemsLoaded(ENTITY_KEY__SPRINT_SNAPSHOT, snapshot_ids)
}

export function getSprintSnapshot(state, snapshot_id) {
    return getItem(state, ENTITY_KEY__SPRINT_SNAPSHOT, snapshot_id)
}

export function getSprintSnapshots(state, snapshot_ids) {
    return getItems(state, ENTITY_KEY__SPRINT_SNAPSHOT, snapshot_ids)
}

export function getSprintSnapshotsById(state, snapshot_ids) {
    return getItemsById(state, ENTITY_KEY__SPRINT_SNAPSHOT, snapshot_ids)
}

export function updateSprintSnapshotDescription(snapshot_id, value) {
    return updateItem(ENTITY_KEY__SPRINT_SNAPSHOT, [snapshot_id], "description", value)
}

export function updateSprintSnapshotHeaders(snapshot_id, name, headers) {
    return updateItem(ENTITY_KEY__SPRINT_SNAPSHOT, [snapshot_id], "headers", {'name':name, 'headers':headers}) 
}

export function startCandidateSprintSnapshot(initial_candidate_props) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__SPRINT_SNAPSHOT, initial_candidate_props || {}))
    }
}

export function updateCandidateDescription(description) {
    return updateCandidateDetails(ENTITY_KEY__SPRINT_SNAPSHOT, {description:description})
}

export function cancelCandidateSprintSnapshot() {
    return cancelCandidateItem(ENTITY_KEY__SPRINT_SNAPSHOT)
}

export function saveCandidateSprintSnapshot(on_done) {
    return saveCandidateItem(ENTITY_KEY__SPRINT_SNAPSHOT, on_done)
}

export function deleteSprintSnapshots(snapshot_ids) {
    return deleteItems(ENTITY_KEY__SPRINT_SNAPSHOT, snapshot_ids)
}

export function getCandidateSprintSnapshot(state) {
    return getCandidateItem(ENTITY_KEY__SPRINT_SNAPSHOT, state)
}

export function getInvalidatedSprintSnapshotIds(state, snapshot_ids) {
    return getInvalidatedItemIds(ENTITY_KEY__SPRINT_SNAPSHOT, state, snapshot_ids)
}

export function getLoadingSprintSnapshotIds(state, snapshot_ids) {
    return getLoadingItemIds(state, ENTITY_KEY__SPRINT_SNAPSHOT, snapshot_ids)
}

export function getSavingSprintSnapshotIds(state, snapshot_ids) {
    return getSavingItemIds(ENTITY_KEY__SPRINT_SNAPSHOT, state, snapshot_ids)
}

export function is_snapshot_invalidated(state, snapshot_id) {
    return is_item_invalidated(ENTITY_KEY__SPRINT_SNAPSHOT, state, snapshot_id)
}
