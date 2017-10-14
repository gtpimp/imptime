import { impfetch } from './lib.js'
import keyBy from 'lodash/keyBy'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__TIMESHEET_DASHBOARD } from '../actions/ItemListKeyRegistry'

export const ANNOUNCE_TIMESHEET_DASHBOARD_LOADED = 'ANNOUNCE_TIMESHEET_DASHBOARD_LOADED'
export const ANNOUNCE_TIMESHEET_DASHBOARD_LOAD_FAILED = 'ANNOUNCE_TIMESHEET_DASHBOARD_LOAD_FAILED'
export const ANNOUNCE_LOADING_TIMESHEET_DASHBOARD = 'ANNOUNCE_LOADING_TIMESHEET_DASHBOARD'
export const INVALIDATE_TIMESHEET_DASHBOARD = 'INVALIDATE_TIMESHEET_DASHBOARD'

const TIMESHEET_DASHBOARD_ID = 'default'

export function invalidateAllTimesheetDashboards() {
    return {
        type: INVALIDATE_TIMESHEET_DASHBOARD,
        timesheet_ids_to_invalidate: [TIMESHEET_DASHBOARD_ID]
    }
}

function announceLoadingTimesheetDashboard() {
    return {
        type: ANNOUNCE_LOADING_TIMESHEET_DASHBOARD,
        timesheet_ids_to_load: [TIMESHEET_DASHBOARD_ID]
    }
}

function announceTimesheetDashboardLoaded(payload) {
    const timesheet_dashboards_by_id = {}
    timesheet_dashboards_by_id[TIMESHEET_DASHBOARD_ID] = payload.timesheet_dashboard
    return {
        type: ANNOUNCE_TIMESHEET_DASHBOARD_LOADED,
        items_by_id: timesheet_dashboards_by_id,
	received_at: Date.now()
    }
}

function announceTimesheetDashboardLoadFailed(error) {
    return {
        type: ANNOUNCE_TIMESHEET_DASHBOARD_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function fetchTimesheetDashboardsPromise(dispatch, state) {
    return new Promise(function(resolve, reject) {
	dispatch(announceLoadingTimesheetDashboard())
	const params = {}

        return impfetch(state, 'imp/time_chart/timesheet_dashboard/', dispatch, {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceTimesheetDashboardLoadFailed())
		    reject(json.error)
                } else {
		    dispatch(announceTimesheetDashboardLoaded(json.payload))
		    resolve(json.payload)
                }
	    }).catch(function (error) {
		dispatch(announceTimesheetDashboardLoadFailed("Failed to load timesheet dashboard: " + error))
		reject("Failed to load timesheet dashboard: " + error)
	    })
    })
}

export function fetchTimesheetDashboardsIfNeeded(list_key) {
    const matching_items_key = ENTITY_KEY__TIMESHEET_DASHBOARD
    const matching_items_promise_func = fetchTimesheetDashboardsPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}

export function ensureTimesheetDashboardLoaded() {
    return (dispatch, getState) => {
        const state = getState()
        // This function uses default just so that it looks like a projects, sprints etc.
        // It will make life much easier if we have multiple timesheet dashboards later.
        const timesheet_ids_to_load = getMissingItemIds(state, [TIMESHEET_DASHBOARD_ID], ENTITY_KEY__TIMESHEET_DASHBOARD)
        if ( timesheet_ids_to_load.length > 0 ) {
            fetchTimesheetDashboardsPromise(dispatch, state)
        }
    }
}

export function getTimesheetDashboard(state) {
    return ((state[ENTITY_KEY__TIMESHEET_DASHBOARD] || {}).items_by_id || {})[TIMESHEET_DASHBOARD_ID] || null
}
