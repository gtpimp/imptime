import { impfetch } from './lib.js'
import keyBy from 'lodash/keyBy'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__PROJECT_DASHBOARD } from '../actions/ItemListKeyRegistry'

export const ANNOUNCE_PROJECT_DASHBOARDS_LOADED = 'ANNOUNCE_PROJECT_DASHBOARDS_LOADED'
export const ANNOUNCE_PROJECT_DASHBOARDS_LOAD_FAILED = 'ANNOUNCE_PROJECT_DASHBOARDS_LOAD_FAILED'
export const ANNOUNCE_LOADING_PROJECT_DASHBOARDS = 'ANNOUNCE_LOADING_PROJECT_DASHBOARDS'
export const INVALIDATE_PROJECT_DASHBOARDS = 'INVALIDATE_PROJECT_DASHBOARDS'
export const INVALIDATE_ALL_PROJECT_DASHBOARDS = 'INVALIDATE_ALL_PROJECT_DASHBOARDS'

export function invalidateAllProjectDashboards() {
    return {
        type: INVALIDATE_ALL_PROJECT_DASHBOARDS
    }
}

export function invalidateProjectDashboards(project_ids) {
    return {
        type: INVALIDATE_PROJECT_DASHBOARDS,
	project_ids_to_invalidate: project_ids
    }
}

function announceLoadingProjectDashboards(project_ids) {
    return {
        type: ANNOUNCE_LOADING_PROJECT_DASHBOARDS,
	project_ids_to_load: project_ids
    }
}

function announceProjectDashboardsLoaded(payload) {
    return {
        type: ANNOUNCE_PROJECT_DASHBOARDS_LOADED,
        items_by_id: keyBy(payload.project_dashboards, 'id'),
        all_sprint_ids: payload.all_sprint_ids,
        all_project_ids: payload.all_project_ids,
        all_user_ids: payload.all_user_ids,
	received_at: Date.now()
    }
}

function announceProjectDashboardsLoadFailed(error) {
    return {
        type: ANNOUNCE_PROJECT_DASHBOARDS_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function fetchProjectDashboardsPromise(dispatch, state, project_ids) {
    return new Promise(function(resolve, reject) {
	      dispatch(announceLoadingProjectDashboards(project_ids))

	const params = { filter: { ids: project_ids },
			 pagination: {'enabled': false} }

        return impfetch(state, 'imp/project_dashboard/', dispatch, {params:params})
	          .then(response => response.json())
	          .then(json => {
                if (json.status !== 'success') {
		                dispatch(announceProjectDashboardsLoadFailed())
		                reject(json.error)
                } else {
		    dispatch(announceProjectDashboardsLoaded(json.payload))
		    resolve(json.payload)
                }
	          }).catch(function (error) {
		            dispatch(announceProjectDashboardsLoadFailed("Failed to load project dashboards: " + error))
		            reject("Failed to load project dashboards: " + error)
	          })
    })
}

export function fetchProjectDashboardsIfNeeded(list_key) {
    const matching_items_key = ENTITY_KEY__PROJECT_DASHBOARD
    const matching_items_promise_func = fetchProjectDashboardsPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}

export function ensureProjectDashboardsLoaded(project_ids) {
    return (dispatch, getState) => {
        const state = getState()
        const project_ids_to_load = getMissingItemIds(state, project_ids, ENTITY_KEY__PROJECT_DASHBOARD)
        if ( project_ids_to_load.length > 0 ) {
            fetchProjectDashboardsPromise(dispatch, state, project_ids_to_load)
        }
    }
}

export function getProjectDashboard(state, project_id) {
    return ((state[ENTITY_KEY__PROJECT_DASHBOARD] || {}).items_by_id || {})[project_id] || null
}

export function getProjectDashboards(state, project_ids) {
    const project_objs = state[ENTITY_KEY__PROJECT_DASHBOARD]
    const items_by_id = (project_objs && project_objs.items_by_id) || {}
    return items_by_id && project_ids && project_ids.map(function (project_id, index) {
        return items_by_id[project_id] || {
            'id': project_id,
            'loaded': false
        }
    })
}

export function getAllProjectIds(state) {
    const project_objs = state[ENTITY_KEY__PROJECT_DASHBOARD] || {}
    return project_objs.all_project_ids || []
}

export function getAllSprintIds(state) {
    const project_objs = state[ENTITY_KEY__PROJECT_DASHBOARD] || {}
    return project_objs.all_sprint_ids || []
}

export function getAllUserIds(state) {
    const project_objs = state[ENTITY_KEY__PROJECT_DASHBOARD] || {}
    return project_objs.all_user_ids || []
}
