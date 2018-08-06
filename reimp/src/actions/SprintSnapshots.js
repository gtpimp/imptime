import { get } from 'lodash'
import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
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
import { ENTITY_KEY__SPRINT_SNAPSHOT } from './ItemListKeyRegistry'

export const START_SPRINT_SNAPSHOT_SELECTOR = 'START_SPRINT_SNAPSHOT_SELECTOR'
export const STOP_SPRINT_SNAPSHOT_SELECTOR = 'STOP_SPRINT_SNAPSHOT_SELECTOR'

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
    const snapshot = getItem(state, ENTITY_KEY__SPRINT_SNAPSHOT, snapshot_id)
    if ( snapshot && snapshot.cost_summary && snapshot.cost_summary.parsed !== true ) {
        snapshot.cost_summary = JSON.parse(snapshot.cost_summary)
        snapshot.cost_summary.parsed = true
    }
    if ( snapshot && snapshot.project_statement && snapshot.project_statement.parsed !== true ) {
        snapshot.project_statement = JSON.parse(snapshot.project_statement)
        snapshot.project_statement.parsed = true
    }
    if ( snapshot && snapshot.time_summary && snapshot.time_summary.parsed !== true ) {
        snapshot.time_summary = JSON.parse(snapshot.time_summary)
        snapshot.time_summary.parsed = true
    }
    if ( snapshot && snapshot.affected_entities && snapshot.affected_entities.parsed !== true ) {
        snapshot.affected_entities = JSON.parse(snapshot.affected_entities)
        snapshot.affected_entities.parsed = true
    }
    return snapshot
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

export function startCandidateSprintSnapshot(sprint_id, initial_candidate_props) {
    return (dispatch, getState) => {
        initial_candidate_props = initial_candidate_props || {}
        initial_candidate_props['sprint_id'] = sprint_id
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

export function startSprintSnapshotSelector() {
    return { type: START_SPRINT_SNAPSHOT_SELECTOR }
}

export function stopSprintSnapshotSelector() {
    return { type: STOP_SPRINT_SNAPSHOT_SELECTOR }
}

export function isSprintSnapshotSelectorActive(state) {
    return get(state, [ "sprint_snapshot", "sprint_snapshot_selector_active"], false)
}
