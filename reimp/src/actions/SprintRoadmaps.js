import { setDisplayMode, getDisplayMode } from './ItemList'
import {
    ENTITY_KEY__SPRINT_ROADMAP,
    medium_col_width,
    large_col_width
} from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    getItemsById
} from '../actions/Item'

export const ALL_AVAILABLE_SPRINT_ROADMAP_HEADERS =
    [ {key:'sprint_name', label:'Sprint', description:'Sprint name', width:large_col_width, is_default:true},
      {key:'sprint_status', label:'Status', description:'Sprint status', width:medium_col_width, is_default:true},
      {key:'sprint_type', label:'Type', description:'Sprint type', width:medium_col_width, is_default:true},
      {key:'sprint_eta', label:'ETA', description:'Configured end date of sprint', width:medium_col_width, is_default:true},
      {key:'features', label:'features', description:'Features in this sprint', width:medium_col_width, is_default:true},
    ]

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
