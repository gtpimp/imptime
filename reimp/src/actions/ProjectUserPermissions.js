import { impfetch } from './lib.js'
import indexOf from 'lodash/indexOf'
import keyBy from 'lodash/keyBy'
import map from 'lodash/map'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__PROJECT_USER_PERMISSION } from '../actions/ItemListKeyRegistry'

// PUP === ProjectUserPermission

export const ANNOUNCE_PUPS_SAVING = 'ANNOUNCE_PUPS_SAVING'
export const ANNOUNCE_PUPS_SAVED = 'ANNOUNCE_PUPS_SAVED'
export const ANNOUNCE_PUPS_SAVE_FAILED = 'ANNOUNCE_PUPS_SAVE_FAILED'

export const ANNOUNCE_PUPS_LOADED = 'ANNOUNCE_PUPS_LOADED'
export const ANNOUNCE_PUPS_LOAD_FAILED = 'ANNOUNCE_PUPS_LOAD_FAILED'
export const ANNOUNCE_LOADING_PUPS = 'ANNOUNCE_LOADING_PUPS'
export const INVALIDATE_PUPS = 'INVALIDATE_PUPS'
export const INVALIDATE_ALL_PUPS = 'INVALIDATE_ALL_PUPS'

export function invalidateAllPups() {
    return {
        type: INVALIDATE_ALL_PUPS
    }
}

export function invalidatePups(pup_ids) {
    return {
        type: INVALIDATE_PUPS,
	pup_ids_to_invalidate: pup_ids
    }
}

function announceLoadingPupsForProjectAndUser(project_id, user_id) {
    return {
        type: ANNOUNCE_LOADING_PUPS,
	project_id: project_id,
        user_id: user_id
    }
}

function announceLoadingPups(pup_ids) {
    return {
        type: ANNOUNCE_LOADING_PUPS,
	pup_ids_to_load: pup_ids
    }
}

function announcePupsLoaded(payload) {
    return {
        type: ANNOUNCE_PUPS_LOADED,
        items_by_id: keyBy(payload.project_user_permissions, 'id'),
	received_at: Date.now()
    }
}

function announcePupsLoadedForProjectAndUser(payload, project_id, user_id) {
    return {
        type: ANNOUNCE_PUPS_LOADED,
        items_by_id: keyBy(payload.project_user_permissions, 'id'),
	received_at: Date.now(),
        project_id: project_id,
        user_id: user_id
    }
}

function announcePupsLoadFailed(error) {
    return {
        type: ANNOUNCE_PUPS_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function announcePupsLoadFailedForProjectAndUser(error, project_id, user_id) {
    return {
        type: ANNOUNCE_PUPS_LOAD_FAILED,
        error: error,
        received_at: Date.now(),
        project_id: project_id,
        user_id: user_id
    }
}

function fetchProjectUserPermission(dispatch, state, project_id, user_id) {
    dispatch(announceLoadingPupsForProjectAndUser(project_id, user_id))
    const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
    const params = { filter: { project_id: project_id,
                               user_id: user_id },
		     pagination: {'enabled': false} }

    debugger;
    return impfetch(API_BASE_URL+'imp/permission/project/', dispatch, {params:params})
	.then(response => response.json())
	.then(json => {
            if (json.status !== 'success') {
		dispatch(announcePupsLoadFailedForProjectAndUser(project_id, user_id))
            } else {
		dispatch(announcePupsLoadedForProjectAndUser(json.payload, project_id, user_id))
            }
	}).catch(function (error) {
	    dispatch(announcePupsLoadFailedForProjectAndUser("Failed to load pups: " + error, project_id, user_id))
	})
}

function fetchPupsPromise(dispatch, state, pup_ids) {
    return new Promise(function(resolve, reject) {
        const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
	dispatch(announceLoadingPups(pup_ids))
	const params = { filter: { ids: pup_ids },
			 pagination: {'enabled': false} }
	
        return impfetch(API_BASE_URL+'imp/permission/project/', dispatch, {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announcePupsLoadFailed())
		    reject(json.error)
                } else {
		    dispatch(announcePupsLoaded(json.payload))
		    resolve(json.payload)
                }
	    }).catch(function (error) {
		dispatch(announcePupsLoadFailed("Failed to load pups: " + error))
		reject("Failed to load pups: " + error)
	    })
    })
}

/* export function fetchPupsIfNeeded(list_key) {
 *     const matching_items_key = ENTITY_KEY__PROJECT_USER_PERMISSION
 *     const matching_items_promise_func = fetchPupsPromise
 *     return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
 * }*/

export function setProjectUserPermission(pup_id, permission_name) {
    return updatePup([pup_id], permission_name, true)
}

export function unsetProjectUserPermission(pup_id, permission_name) {
    return updatePup([pup_id], permission_name, false)
}

/* export function ensurePupsLoaded(pup_ids) {
 *     return (dispatch, getState) => {
 *         const state = getState()
 *         const pup_ids_to_load = getMissingItemIds(state, pup_ids, 'pup')
 *         if ( pup_ids_to_load.length > 0 ) {
 *             fetchPupsPromise(dispatch, state, pup_ids_to_load)
 *         }
 *     }
 * }*/

function getPupIdForProjectUser(state, project_id, user_id) {
    return (((state.project_user_permission || {}).pup_ids_by_project_and_user || {})[project_id] || {})[user_id] || null
}

function getPupIdsForProjectUsers(state, project_id, user_ids) {
    return map(user_ids, (user_id) => getPupIdForProjectUser(state, project_id, user_id))
}

function isPupLoadingForProjectUser(state, project_id, user_id) {
    return (((state.project_user_permission || {}).loading_pups_by_project_and_user || {})[project_id] || {})[user_id] === true
} 

export function ensureProjectUserPermissionsLoaded(project_id, user_id) {
    return (dispatch, getState) => {
        const state = getState()
        if ( isPupLoadingForProjectUser(state, project_id, user_id) ) {
            return;
        }
        const pup_id = getPupIdForProjectUser(state, project_id, user_id)
        if ( pup_id == null ) {
            fetchProjectUserPermission(dispatch, state, project_id, user_id)
        }
    }
}

function getPup(state, pup_id) {
    return ((state.pup || {}).items_by_id || {})[pup_id] || null
}

function getPups(state, pup_ids) {
    const pup_objs = state.pup
    const items_by_id = (pup_objs && pup_objs.items_by_id) || {}
    return items_by_id && pup_ids && pup_ids.map(function (pup_id, index) {
        return items_by_id[pup_id] || {
            'id': pup_id,
            'loaded': false
        }
    })    
}

export function getProjectUserPermission(state, project_id, user_id ) {
    const pup_id = getPupIdForProjectUser(state, project_id, user_id)
    return getPup(state, pup_id)
}

function announcePupSaveFailed(error) {
    return {
        type: ANNOUNCE_PUPS_SAVE_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function announcePupsSaved(pup_ids) {
    return {
        type: ANNOUNCE_PUPS_SAVED,
        pup_ids: pup_ids,
        saved_at: Date.now()
    }
}

function announcePupsSaving(pup_ids, field_name, new_value) {
    return {
        type: ANNOUNCE_PUPS_SAVING,
        pup_ids: pup_ids,
	field_name: field_name,
	new_value: new_value
    }
}

function updatePup(pup_ids, field_name, new_value, on_done) {
    return (dispatch, getState) => {
        const state = getState()
        const API_BASE_URL = state.settings.configured && state.settings.API_BASE_URL
	dispatch(announcePupsSaving(pup_ids, field_name, new_value))
	let data = {pup_ids: pup_ids,
                    field_name: field_name,
		    value: new_value }
	return impfetch(API_BASE_URL+"imp/pup/"+pup_ids[0]+"/", dispatch,
			{method: "PUT",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"}, 
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announcePupSaveFailed(json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
                 dispatch(announcePupsSaved(pup_ids))
             }
	     if ( on_done ) {
		 on_done()
	     }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announcePupSaveFailed(error))
	 })
    }
}
