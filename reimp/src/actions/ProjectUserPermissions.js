import { impfetch } from './lib.js'
import { keyBy, get } from 'lodash'

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

function announceLoadingPupsForProjectAndUser(pup_ids, project_id) {
    return {
        type: ANNOUNCE_LOADING_PUPS,
	project_id: project_id,
        pup_ids_to_load: pup_ids
    }
}

function announcePupsLoadedForProjectAndUser(payload, project_id) {
    return {
        type: ANNOUNCE_PUPS_LOADED,
        items_by_id: keyBy(payload.project_user_permissions, 'id'),
	received_at: Date.now(),
        project_id: project_id
    }
}

function announcePupsLoadFailedForProjectAndUser(error, project_id) {
    return {
        type: ANNOUNCE_PUPS_LOAD_FAILED,
        error: error,
        received_at: Date.now(),
        project_id: project_id
    }
}

function fetchProjectUserPermissions(project_id) {
    return (dispatch, getState) => {
        const state = getState()
        const pup_ids = getPupIdsForProjectUser(state, project_id)
        dispatch(announceLoadingPupsForProjectAndUser(pup_ids, project_id))
        const params = { filter: { project_id: project_id },
		         pagination: {'enabled': false} }

        return impfetch(state, 'imp/permission/project/', dispatch, {params:params})
	          .then(response => response.json())
	          .then(json => {
                if (json.status !== 'success') {
		                dispatch(announcePupsLoadFailedForProjectAndUser(project_id))
                } else {
		                dispatch(announcePupsLoadedForProjectAndUser(json.payload, project_id))
                }
	          }).catch(function (error) {
	              dispatch(announcePupsLoadFailedForProjectAndUser("Failed to load pups: " + error, project_id))
	          })

    }
}

function getPupIdsForProjectUser(state, project_id) {
    return get(state, ["project_user_permission", "pup_ids_by_project_and_user", project_id], [])
}

function arePupsLoading(state, project_id) {
    return get(state, ["project_user_permission", "loading_pups_by_project_and_user", project_id], false) === true
}

export function getLoadingProjectUserPermissionIds(state) {
    return state.project_user_permission.loading_item_ids
}

export function getInvalidatedProjectUserPermissionIds(state) {
    return state.project_user_permission.invalidated_item_ids
}

export function ensureProjectUserPermissionsLoaded(project_id) {
    return (dispatch, getState) => {
        const state = getState()
        if ( arePupsLoading(state, project_id) ) {
            return;
        }
        let pup_ids = getPupIdsForProjectUser(state, project_id)
        let need_to_fetch = false
        if ( pup_ids.length === 0 ) {
            need_to_fetch = true
        } else if ( get(state, ["project_user_permission", "invalidated_item_ids"], []).length > 0 ) {
            need_to_fetch = true
        }

        if ( need_to_fetch === true ) {
            dispatch(fetchProjectUserPermissions(project_id))
        }
    }
}

function getPup(state, pup_id) {
    return ((state.project_user_permission || {}).items_by_id || {})[pup_id] || null
}

export function hasPermission(state, project_id, user_id, permission_name) {
    const pup = getProjectUserPermission(state, project_id, user_id)
    if ( pup == null ) {
        return false
    }
    return pup[permission_name] === true
}

export function getProjectUserPermission(state, project_id, user_id ) {
    const pup_id = getPupIdsForProjectUser(state, project_id)[user_id]
    return getPup(state, pup_id)
}

function announcePupSaveFailedForProjectAndUser(project_id, user_id, error) {
    return {
        type: ANNOUNCE_PUPS_SAVE_FAILED,
        error: error,
        received_at: Date.now(),
        project_id: project_id,
        user_id: user_id
    }
}

function announcePupsSavedForProjectAndUser(project_id, user_id) {
    return {
        type: ANNOUNCE_PUPS_SAVED,
        project_id: project_id,
        user_id: user_id,
        saved_at: Date.now()
    }
}

function announcePupsSavingForProjectAndUser(project_id, user_id) {
    return {
        type: ANNOUNCE_PUPS_SAVING,
        project_id: project_id,
        user_id: user_id,
    }
}

export function updateProjectUserPermissions(project_id, user_id, permission_values, on_done) {
    return (dispatch, getState) => {
        const state = getState()
	dispatch(announcePupsSavingForProjectAndUser(project_id, user_id))
	let data = {project_id: project_id,
                    user_ids: [user_id],
                    permission_values}

	return impfetch(state, "imp/permission/project/?project_id="+project_id+"&user_id="+user_id, dispatch,
			{method: "POST",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"},
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announcePupSaveFailedForProjectAndUser(project_id, user_id, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
                 dispatch(announcePupsSavedForProjectAndUser(project_id, user_id))
             }
	     if ( on_done ) {
		 on_done()
	     }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announcePupSaveFailedForProjectAndUser(project_id, user_id, error))
	 })
    }
}
