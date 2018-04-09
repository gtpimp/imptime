import { setDisplayMode, getDisplayMode } from './ItemList'
import { ENTITY_KEY__SPRINT_ROADMAP } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    getItemsById
} from '../actions/Item'

export function getSprintRoadmapIdsFromSprintIds(sprint_ids) {
    return sprint_ids
}

export function setSprintWidthMode(list_key, mode) {
    return setDisplayMode(list_key, mode)
}

export function getSprintWidthMode(state, list_key) {
    return getDisplayMode(state, list_key) || "clock"
}

export function invalidateAllSprintRoadmaps() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__SPRINT_ROADMAP))
    }
}

export function invalidateSprintRoadmaps(sprint_roadmap_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__SPRINT_ROADMAP,
                                 sprint_roadmap_ids_to_invalidate
        ))
    }
}

export function fetchSprintRoadmapsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__SPRINT_ROADMAP, list_key))
    }
}

export function ensureSprintRoadmapsLoaded(sprint_roadmap_ids) {
    return ensureItemsLoaded(ENTITY_KEY__SPRINT_ROADMAP, sprint_roadmap_ids)
}

export function getSprintRoadmap(state, sprint_roadmap_id) {
    return getItem(state, ENTITY_KEY__SPRINT_ROADMAP, sprint_roadmap_id)
}

export function getSprintRoadmaps(state, sprint_roadmap_ids) {
    return getItems(state, ENTITY_KEY__SPRINT_ROADMAP, sprint_roadmap_ids)
}

export function getSprintRoadmapsById(state, sprint_roadmap_ids) {
    return getItemsById(state, ENTITY_KEY__SPRINT_ROADMAP, sprint_roadmap_ids)
}
