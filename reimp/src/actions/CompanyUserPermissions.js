import { impfetch } from './lib.js'
import { keys, keyBy, get, filter } from 'lodash'

// CUP === CompanyUserPermission

export const ANNOUNCE_CUPS_SAVING = 'ANNOUNCE_CUPS_SAVING'
export const ANNOUNCE_CUPS_SAVED = 'ANNOUNCE_CUPS_SAVED'
export const ANNOUNCE_CUPS_SAVE_FAILED = 'ANNOUNCE_CUPS_SAVE_FAILED'

export const ANNOUNCE_CUPS_LOADED = 'ANNOUNCE_CUPS_LOADED'
export const ANNOUNCE_CUPS_LOAD_FAILED = 'ANNOUNCE_CUPS_LOAD_FAILED'
export const ANNOUNCE_LOADING_CUPS = 'ANNOUNCE_LOADING_CUPS'
export const INVALIDATE_CUPS = 'INVALIDATE_CUPS'
export const INVALIDATE_ALL_CUPS = 'INVALIDATE_ALL_CUPS'

export function invalidateAllCups() {
    return {
        type: INVALIDATE_ALL_CUPS
    }
}

export function invalidateCups(cup_ids) {
    return {
        type: INVALIDATE_CUPS,
	cup_ids_to_invalidate: cup_ids
    }
}

function announceLoadingCupsForCompanyAndUser(cup_ids, company_id) {
    return {
        type: ANNOUNCE_LOADING_CUPS,
	company_id: company_id,
        cup_ids_to_load: cup_ids
    }
}

function announceCupsLoadedForCompanyAndUser(payload, company_id) {
    return {
        type: ANNOUNCE_CUPS_LOADED,
        items_by_id: keyBy(payload.company_user_permissions, 'id'),
	received_at: Date.now(),
        company_id: company_id
    }
}

function announceCupsLoadFailedForCompanyAndUser(error, company_id) {
    return {
        type: ANNOUNCE_CUPS_LOAD_FAILED,
        error: error,
        received_at: Date.now(),
        company_id: company_id
    }
}

function fetchCompanyUserPermissions(company_id) {
    return (dispatch, getState) => {
        const state = getState()
        const cup_ids = getCupIdsForCompanyUser(state, company_id)
        dispatch(announceLoadingCupsForCompanyAndUser(cup_ids, company_id))
        const params = { filter: { company_id: company_id },
		         pagination: {'enabled': false} }

        return impfetch(state, 'imp/permission/company/', dispatch, {params:params})
	          .then(response => response.json())
	          .then(json => {
                if (json.status !== 'success') {
		                dispatch(announceCupsLoadFailedForCompanyAndUser(company_id))
                } else {
		                dispatch(announceCupsLoadedForCompanyAndUser(json.payload, company_id))
                }
	          }).catch(function (error) {
	              dispatch(announceCupsLoadFailedForCompanyAndUser("Failed to load cups: " + error, company_id))
	          })

    }
}

function getCupIdsForCompanyUser(state, company_id) {
    return get(state, ["company_user_permission", "cup_ids_by_company_and_user", company_id], [])
}

function getCup(state, cup_id) {
    return get(state, ["company_user_permission", "items_by_id", cup_id], [])
}

function getCupsForCompany(state, company_id) {
    return get(state, ["company_user_permission", "items_by_id"], [])
}

function areCupsLoading(state, company_id) {
    return get(state, ["company_user_permission", "loading_cups_by_company_and_user", company_id], false) === true
}

export function getUserIdsWithPermission(state, company_id, permission_name) {
    const cups = getCupsForCompany(state, company_id)
    return keys(keyBy(filter(cups, cup => cup[permission_name] === true), "user_id"))
}

export function getLoadingCompanyUserPermissionIds(state) {
    return state.company_user_permission.loading_item_ids
}

export function getInvalidatedCompanyUserPermissionIds(state) {
    return state.company_user_permission.invalidated_item_ids
}

export function ensureCompanyUserPermissionsLoaded(company_id) {
    return (dispatch, getState) => {
        const state = getState()
        if ( areCupsLoading(state, company_id) ) {
            return;
        }
        let cup_ids = getCupIdsForCompanyUser(state, company_id)
        let need_to_fetch = false
        if ( cup_ids.length === 0 ) {
            need_to_fetch = true
        } else if ( get(state, ["company_user_permission", "invalidated_item_ids"], []).length > 0 ) {
            need_to_fetch = true
        }

        if ( need_to_fetch === true ) {
            dispatch(fetchCompanyUserPermissions(company_id))
        }
    }
}

export function hasPermission(state, company_id, user_id, permission_name) {
    const cup = getCompanyUserPermission(state, company_id, user_id)
    if ( cup == null ) {
        return false
    }
    return cup[permission_name] === true
}

export function getCompanyUserPermission(state, company_id, user_id ) {
    const cup_id = getCupIdsForCompanyUser(state, company_id)[user_id]
    return getCup(state, cup_id)
}

function announceCupSaveFailedForCompanyAndUser(company_id, user_id, error) {
    return {
        type: ANNOUNCE_CUPS_SAVE_FAILED,
        error: error,
        received_at: Date.now(),
        company_id: company_id,
        user_id: user_id
    }
}

function announceCupsSavedForCompanyAndUser(company_id, user_id) {
    return {
        type: ANNOUNCE_CUPS_SAVED,
        company_id: company_id,
        user_id: user_id,
        saved_at: Date.now()
    }
}

function announceCupsSavingForCompanyAndUser(company_id, user_id) {
    return {
        type: ANNOUNCE_CUPS_SAVING,
        company_id: company_id,
        user_id: user_id,
    }
}

export function updateCompanyUserPermissions(company_id, user_id, permission_values, on_done) {
    return (dispatch, getState) => {
        const state = getState()
	dispatch(announceCupsSavingForCompanyAndUser(company_id, user_id))
	let data = {company_id: company_id,
                    user_ids: [user_id],
                    permission_values}

	return impfetch(state, "imp/permission/company/?company_id="+company_id+"&user_id="+user_id, dispatch,
			{method: "POST",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"},
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceCupSaveFailedForCompanyAndUser(company_id, user_id, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
                 dispatch(announceCupsSavedForCompanyAndUser(company_id, user_id))
             }
	     if ( on_done ) {
		 on_done()
	     }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceCupSaveFailedForCompanyAndUser(company_id, user_id, error))
	 })
    }
}

export function convert_permission_name_to_label(permission_name) {
    return permission_name.replace(/_/g, " ")
}
