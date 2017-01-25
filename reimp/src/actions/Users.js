import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import map from 'lodash/map'
import { setErrorMessage } from '../actions/Error'
import { GLOBAL_SETTINGS } from '../settings'

export const ANNOUNCE_USERS_LOADED = 'ANNOUNCE_USERS_LOADED'
export const ANNOUNCE_USERS_LOAD_FAILED = 'ANNOUNCE_USERS_LOAD_FAILED'
export const ANNOUNCE_LOADING_USERS = 'ANNOUNCE_LOADING_USERS'
export const INVALIDATE_USERS = 'INVALIDATE_USERS'

export function invalidateUsers(user_ids_to_invalidate) {
    return {
	type: INVALIDATE_USERS,
	user_ids_to_invalidate: user_ids_to_invalidate
    }
}

function announceLoadingUsers(user_ids) {
    return {
        type: ANNOUNCE_LOADING_USERS,
	user_ids_to_load: user_ids
    }
}

function announceUsersLoaded(payload) {

    let items_by_id = {}
    payload.users.map((item, index) => {
        items_by_id[item.id] = item
    });
    
    return {
        type: ANNOUNCE_USERS_LOADED,
        items_by_id: items_by_id,
	received_at: Date.now()
    }
}

function announceUsersLoadFailed(error) {
    return {
        type: ANNOUNCE_USERS_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function fetchUsers(dispatch, user_ids) {
    return (dispatch, getState) => {
        const state = getState()
        const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
	dispatch(announceLoadingUsers(user_ids))

	const params = { filter: { ids: user_ids },
			 format: { detail_level: 'general' },
			 pagination: {'enabled': false} }
	
        return impfetch(API_BASE_URL+'imp/user/', {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status != 'success') {
		    dispatch(announceUsersLoadFailed(json.error))
                } else {
		    dispatch(announceUsersLoaded(json.payload))
                }
	    }).catch(function (error) {
		dispatch(announceUsersLoadFailed("Failed to load users: " + error.message))
	    })
    }
}

function getMissingUsers(state, required_user_ids) {
    const matching_items = state.user || {}
    const matching_item_ids = keys(matching_items.items_by_id || {})
    const matching_item_refs = matching_item_ids.map((item_id, index) => "" + item_id)
    const loading_item_ids = matching_items.loading_item_ids || []
    const loading_item_refs = map(loading_item_ids, (item_id, index) => "" + item_id)
    const required_item_refs = required_user_ids.map((item_id, index) => "" + item_id)
    const unmatching_item_refs = difference(required_item_refs, matching_item_refs)
    const unmatching_and_not_loading_item_refs = difference(unmatching_item_refs, loading_item_refs)
    return unmatching_and_not_loading_item_refs
}

export function fetchUsersIfNeeded(user_ids) {
    return (dispatch, getState) => {
	const state = getState()
	const missing_user_ids = getMissingUsers(state, user_ids)
	if ( missing_user_ids.length > 0 ) {
	    dispatch(fetchUsers(dispatch, missing_user_ids))
	}
    }
}
