import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import map from 'lodash/map'
import { getMissingItemIds } from './ItemList'

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
    payload.users.map((item) => {
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

function fetchUsers(user_ids) {
    return (dispatch, getState) => {
        const state = getState()
        const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
	dispatch(announceLoadingUsers(user_ids))

	const params = { filter: { ids: user_ids },
			 format: { detail_level: 'general' },
			 pagination: {'enabled': false} }
	
        return impfetch(API_BASE_URL+'imp/user/', dispatch, {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceUsersLoadFailed(json.error))
                } else {
		    dispatch(announceUsersLoaded(json.payload))
                }
	    }).catch(function (error) {
		dispatch(announceUsersLoadFailed("Failed to load users: " + error.message))
	    })
    }
}

export function ensureUsersLoaded(user_ids) {
    return (dispatch, getState) => {
        const state = getState()

        const user_ids_to_load = getMissingItemIds(state, user_ids, 'user')
        if ( user_ids_to_load.length > 0 ) {
            dispatch(fetchUsers(user_ids_to_load))
        }
    }
}

export function getUser(state, user_id) {
    return ((state.user || {}).items_by_id || {})[user_id] || null
}

export function getUsers(state, user_ids) {
    const user_objs = state.user
    const items_by_id = (user_objs && user_objs.items_by_id) || {}
    return items_by_id && user_ids && user_ids.map(function (user_id, index) {
        return items_by_id[user_id] || {
            'id': user_id,
            'username': 'loading...',
            'loaded': false
        }
    })    
}
