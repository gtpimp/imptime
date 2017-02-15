import { impfetch } from './lib.js'
import { getMissingItemIds } from './ItemList'
import { logged_in_user } from './Auth'
import each from 'lodash/each'

export const ANNOUNCE_USERS_LOADED = 'ANNOUNCE_USERS_LOADED'
export const ANNOUNCE_USERS_LOAD_FAILED = 'ANNOUNCE_USERS_LOAD_FAILED'
export const ANNOUNCE_LOADING_USERS = 'ANNOUNCE_LOADING_USERS'
export const INVALIDATE_USERS = 'INVALIDATE_USERS'

export const ANNOUNCE_SAVING_INVITE = 'ANNOUNCE_SAVING_INVITE'
export const ANNOUNCE_SAVED_INVITE = 'ANNOUNCE_SAVED_INVITE'
export const ANNOUNCE_SAVE_INVITE_FAILED = 'ANNOUNCE_SAVE_INVITE_FAILED'
export const CANCEL_INVITING_USER = 'CANCEL_INVITING_USER'

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
    each(payload.users, (item) => {
        items_by_id[item.id] = item
    })
    
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

function announceSavingInvite(user_id, project_id) {
    return {
        type: ANNOUNCE_SAVING_INVITE,
        user_id: user_id,
        project_id: project_id
    }
}

function announceInviteSaved(user_id, project_id, payload) {
    return {
        type: ANNOUNCE_SAVED_INVITE,
        user_id: user_id,
        project_id: project_id,
        payload: payload
    }
}

function announceInviteSaveFailed(user_id, project_id, error) {
    return {
        type: ANNOUNCE_SAVE_INVITE_FAILED,
        user_id: user_id,
        project_id: project_id,
        error: error
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
		dispatch(announceUsersLoadFailed("Failed to load users: " + (error || {}).message))
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

export function has_permission(state, permission_name) {
    const user_id = logged_in_user().user_id
    if ( ! user_id ) {
        return false
    }
    const user = getUser(state, user_id)
    if ( ! user ) {
        return false
    }
    const permissions = user.user_permissions
    return permissions[permission_name] || false
}

export function cancelInviteUser() {
    return {
	type: CANCEL_INVITING_USER
    }
}

export function saveInviteUser(project_id, user_id) {

    return (dispatch, getState) => {
	const state = getState()
        const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
	dispatch(announceSavingInvite())
	let data = {user_id: user_id}
	
	return impfetch(API_BASE_URL+"imp/project/"+project_id+"/invite/", dispatch,
			{method: "POST",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"}, 
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceInviteSaveFailed(user_id, project_id, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceInviteSaved(user_id, project_id, json.payload))
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceInviteSaveFailed(user_id, project_id, error))
	 })
    }

}
