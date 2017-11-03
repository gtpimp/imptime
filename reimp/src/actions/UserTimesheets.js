import { impfetch } from './lib.js'
import keyBy from 'lodash/keyBy'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__USER_TIMESHEET } from '../actions/ItemListKeyRegistry'

export const ANNOUNCE_USER_TIMESHEETS_LOADED = 'ANNOUNCE_USER_TIMESHEETS_LOADED'
export const ANNOUNCE_USER_TIMESHEETS_LOAD_FAILED = 'ANNOUNCE_USER_TIMESHEETS_LOAD_FAILED'
export const ANNOUNCE_LOADING_USER_TIMESHEETS = 'ANNOUNCE_LOADING_USER_TIMESHEETS'
export const INVALIDATE_USER_TIMESHEETS = 'INVALIDATE_USER_TIMESHEETS'
export const INVALIDATE_ALL_USER_TIMESHEETS = 'INVALIDATE_ALL_USER_TIMESHEETS'

export function invalidateAllUserTimesheets() {
    return {
        type: INVALIDATE_ALL_USER_TIMESHEETS
    }
}

export function invalidateUserTimesheets(user_ids) {
    return {
        type: INVALIDATE_USER_TIMESHEETS,
	user_ids_to_invalidate: user_ids
    }
}

function announceLoadingUserTimesheets(user_ids) {
    return {
        type: ANNOUNCE_LOADING_USER_TIMESHEETS,
	user_ids_to_load: user_ids
    }
}

function announceUserTimesheetsLoaded(payload) {
    return {
        type: ANNOUNCE_USER_TIMESHEETS_LOADED,
        items_by_id: keyBy(payload.user_timesheets, 'id'),
	received_at: Date.now()
    }
}

function announceUserTimesheetsLoadFailed(error) {
    return {
        type: ANNOUNCE_USER_TIMESHEETS_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function fetchUserTimesheetsPromise(dispatch, state, user_ids) {
    return new Promise(function(resolve, reject) {
	dispatch(announceLoadingUserTimesheets(user_ids))

	const params = { filter: { ids: user_ids },
			 pagination: {'enabled': false} }

        return impfetch(state, 'imp/time_chart/user_timesheet/', dispatch, {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceUserTimesheetsLoadFailed())
		    reject(json.error)
                } else {
		    dispatch(announceUserTimesheetsLoaded(json.payload))
		    resolve(json.payload)
                }
	    }).catch(function (error) {
		dispatch(announceUserTimesheetsLoadFailed("Failed to load user timesheets: " + error))
		reject("Failed to load user timesheets: " + error)
	    })
    })
}

export function fetchUserTimesheetsIfNeeded(list_key) {
    const matching_items_key = ENTITY_KEY__USER_TIMESHEET
    const matching_items_promise_func = fetchUserTimesheetsPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func,
                             { fetch_item_ids_url: 'imp/time_chart/user_timesheet/' })
}

export function ensureUserTimesheetsLoaded(user_ids) {
    return (dispatch, getState) => {
        const state = getState()
        const user_ids_to_load = getMissingItemIds(state, user_ids, ENTITY_KEY__USER_TIMESHEET)
        if ( user_ids_to_load.length > 0 ) {
            fetchUserTimesheetsPromise(dispatch, state, user_ids_to_load)
        }
    }
}

export function getUserTimesheet(state, user_id) {
    return ((state[ENTITY_KEY__USER_TIMESHEET] || {}).items_by_id || {})[user_id] || null
}

export function getUserTimesheets(state, user_ids) {
    const project_objs = state[ENTITY_KEY__USER_TIMESHEET]
    const items_by_id = (project_objs && project_objs.items_by_id) || {}
    return items_by_id && user_ids && user_ids.map(function (user_id, index) {
        return items_by_id[user_id] || {
            'id': user_id,
            'loaded': false
        }
    })
}
