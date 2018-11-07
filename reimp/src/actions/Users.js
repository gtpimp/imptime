import { impfetch } from './lib.js'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__USER } from '../actions/ItemListKeyRegistry'
import { logged_in_user } from './Auth'
import { getProject } from './Projects'
import { getCompany } from './Companies'
import { keyBy } from 'lodash'

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
    items_by_id = keyBy(payload.users, 'id')

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

function fetchUsersPromise(dispatch, state, user_ids) {

    return new Promise(function(resolve, reject) {
	      dispatch(announceLoadingUsers(user_ids))

	      const params = { filter: { ids: user_ids },
			                   pagination: {'enabled': false} }

        return impfetch(state, 'imp/user/', dispatch, {params:params})
	          .then(response => response.json())
	          .then(json => {
                if (json.status !== 'success') {
		                dispatch(announceUsersLoadFailed())
		                reject(json.error)
                } else {
		                dispatch(announceUsersLoaded(json.payload))
		                resolve(json.payload)
                }
	          }).catch(function (error) {
		            dispatch(announceUsersLoadFailed("Failed to load users: " + error))
		            reject("Failed to load users: " + error)
	          })
    })
}

export function fetchUsersIfNeeded(list_key) {
    const matching_items_key = ENTITY_KEY__USER
    const matching_items_promise_func = fetchUsersPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}

export function ensureUsersLoaded(user_ids) {
    return (dispatch, getState) => {
        const state = getState()

        const user_ids_to_load = getMissingItemIds(state, user_ids, 'user')
        if ( user_ids_to_load.length > 0 ) {
            fetchUsersPromise(dispatch, state, user_ids_to_load)
        }
    }
}

export function getUser(state, user_id) {
    return ((state.user || {}).items_by_id || {})[user_id] || null
}

export function getLoggedInUser(state) {
    const user_id = logged_in_user().user_id
    if ( ! user_id ) {
        return null
    }
    return getUser(state, user_id) || null
}

export function getUsers(state, user_ids) {
    const user_objs = (state || {}).user || {}
    const items_by_id = (user_objs && user_objs.items_by_id) || {}
    return items_by_id && user_ids && user_ids.map(function (user_id, index) {
        return items_by_id[user_id] || {
            'id': user_id,
            'username': 'loading...',
            'loaded': false
        }
    })
}

export function logged_in_users_permissions(state, project_id) {
    const project = getProject(state, project_id)
    if ( ! project ) {
        return {}
    }
    return project.logged_in_users_permissions || {}
}

export function has_permission(state, project_id, permission_name) {
    return logged_in_users_permissions(state, project_id)[permission_name] || false
}

export function logged_in_users_company_permissions(state, company_id) {
    const company = getCompany(state, company_id)
    if ( ! company ) {
        return {}
    }
    return company.logged_in_users_permissions || {}
}

export function has_company_permission(state, company_id, permission_name) {
    return logged_in_users_company_permissions(state, company_id)[permission_name] || false
}
