import { impfetch } from './lib.js'
import { map, keyBy, includes, indexOf, get } from 'lodash'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__SPRINT_USER_RATE } from '../actions/ItemListKeyRegistry'

// SUR === SprintUserRate

export const ANNOUNCE_SURS_SAVING = 'ANNOUNCE_SURS_SAVING'
export const ANNOUNCE_SURS_SAVED = 'ANNOUNCE_SURS_SAVED'
export const ANNOUNCE_SURS_SAVE_FAILED = 'ANNOUNCE_SURS_SAVE_FAILED'

export const ANNOUNCE_SURS_LOADED = 'ANNOUNCE_SURS_LOADED'
export const ANNOUNCE_SURS_LOAD_FAILED = 'ANNOUNCE_SURS_LOAD_FAILED'
export const ANNOUNCE_LOADING_SURS = 'ANNOUNCE_LOADING_SURS'
export const INVALIDATE_SURS = 'INVALIDATE_SURS'
export const INVALIDATE_ALL_SURS = 'INVALIDATE_ALL_SURS'
export const INVALIDATE_SUR_FOR_SPRINT_AND_USER = 'INVALIDATE_SUR_FOR_SPRINT_AND_USER'

export function invalidateAllSurs() {
    return {
        type: INVALIDATE_ALL_SURS
    }
}

export function invalidateSurs(sur_ids) {
    return {
        type: INVALIDATE_SURS,
	sur_ids_to_invalidate: sur_ids
    }
}

export function invalidateSurForSprintAndUser(sprint_id, user_id) {
    return {
        type: INVALIDATE_SUR_FOR_SPRINT_AND_USER,
        sprint_id: sprint_id,
        user_id: user_id
    }
}

function announceLoadingSursForSprintAndUser(sur_id, sprint_id, user_id) {
    return {
        type: ANNOUNCE_LOADING_SURS,
	sprint_id: sprint_id,
        user_id: user_id,
        sur_ids_to_load: [sur_id]
    }
}

function announceLoadingSurs(sur_ids) {
    return {
        type: ANNOUNCE_LOADING_SURS,
	sur_ids_to_load: sur_ids
    }
}

function announceSursLoaded(payload) {
    return {
        type: ANNOUNCE_SURS_LOADED,
        items_by_id: keyBy(payload.sprint_user_rates, 'id'),
	received_at: Date.now()
    }
}

function announceSursLoadedForSprintAndUser(payload, sprint_id, user_id) {
    return {
        type: ANNOUNCE_SURS_LOADED,
        items_by_id: keyBy(payload.sprint_user_rates, 'id'),
	received_at: Date.now(),
        sprint_id: sprint_id,
        user_id: user_id
    }
}

function announceSursLoadFailed(error) {
    return {
        type: ANNOUNCE_SURS_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function announceSursLoadFailedForSprintAndUser(error, sprint_id, user_id) {
    return {
        type: ANNOUNCE_SURS_LOAD_FAILED,
        error: error,
        received_at: Date.now(),
        sprint_id: sprint_id,
        user_id: user_id
    }
}

function fetchSprintUserRate(sprint_id, user_id) {
    return (dispatch, getState) => {
        const state = getState()
        const sur_id = getSurIdForSprintUser(state, sprint_id, user_id)
        dispatch(announceLoadingSursForSprintAndUser(sur_id, sprint_id, user_id))
        const params = { filter: { sprint_id: sprint_id,
                                   user_id: user_id },
		         pagination: {'enabled': false} }

        return impfetch(state, 'imp/rate/sprint/', dispatch, {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceSursLoadFailedForSprintAndUser(sprint_id, user_id))
                } else {
		    dispatch(announceSursLoadedForSprintAndUser(json.payload, sprint_id, user_id))
                }
	    }).catch(function (error) {
	        dispatch(announceSursLoadFailedForSprintAndUser("Failed to load surs: " + error, sprint_id, user_id))
	    })

    }
}

function fetchSursPromise(dispatch, state, sur_ids) {
    return new Promise(function(resolve, reject) {
	dispatch(announceLoadingSurs(sur_ids))
	const params = { filter: { ids: sur_ids },
			 pagination: {'enabled': false} }

        return impfetch(state, 'imp/rate/sprint/', dispatch, {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceSursLoadFailed())
		    reject(json.error)
                } else {
		    dispatch(announceSursLoaded(json.payload))
		    resolve(json.payload)
                }
	    }).catch(function (error) {
		dispatch(announceSursLoadFailed("Failed to load surs: " + error))
		reject("Failed to load surs: " + error)
	    })
    })
}

function getSurIdForSprintUser(state, sprint_id, user_id) {
    return get(state, ["sprint_user_rate", "sur_ids_by_sprint_and_user", sprint_id, user_id], null)
}

function getSurIdsForSprintUsers(state, sprint_id, user_ids) {
    return map(user_ids, (user_id) => getSurIdForSprintUser(state, sprint_id, user_id))
}

function isSurLoadingForSprintUser(state, sprint_id, user_id) {
    return get(state, ["sprint_user_rate", "loading_surs_by_sprint_and_user", sprint_id, user_id], false) === true
}

export function getLoadingSprintUserRateIds(state) {
    return get(state, ["sprint_user_rate", "loading_item_ids"], [])
}

export function isSurLoading(state, sur_id) {
    return includes(getLoadingSprintUserRateIds(state), sur_id)
}

export function getInvalidatedSprintUserRateIds(state) {
    return get(state, ["sprint_user_rate", "invalidated_item_ids"], [])
}

export function isSurInvalidated(state, sur_id) {
    return includes(getInvalidatedSprintUserRateIds(state), sur_id)
}

export function ensureSprintUserRateLoaded(sprint_id, user_id) {
    return (dispatch, getState) => {
        const state = getState()
        if ( isSurLoadingForSprintUser(state, sprint_id, user_id) ) {
            return;
        }
        let sur_id = getSurIdForSprintUser(state, sprint_id, user_id)

        if ( sur_id != null || getSur(state, sur_id) != null ) {
            const matching_items = state.sprint_user_rate || {}
            const invalidated_item_refs = map(matching_items.invalidated_item_ids || [], function(item_id, index) { return "" + item_id })
            if ( includes(invalidated_item_refs, sur_id) ) {
                sur_id = null
            }
        }

        if ( sur_id == null || getSur(state, sur_id) == null ) {
            dispatch(fetchSprintUserRate(sprint_id, user_id))
        }
    }
}

function getSur(state, sur_id) {
    return ((state.sprint_user_rate || {}).items_by_id || {})[sur_id] || null
}

function getSurs(state, sur_ids) {
    const sur_objs = state.sur
    const items_by_id = (sur_objs && sur_objs.items_by_id) || {}
    return items_by_id && sur_ids && sur_ids.map(function (sur_id, index) {
        return items_by_id[sur_id] || {
            'id': sur_id,
            'loaded': false
        }
    })
}

export function hasRate(state, sprint_id, user_id, rate_name) {
    const sur = getSprintUserRate(state, sprint_id, user_id)
    if ( sur == null ) {
        return false
    }
    return sur[rate_name] === true
}

export function getSprintUserRate(state, sprint_id, user_id ) {
    const sur_id = getSurIdForSprintUser(state, sprint_id, user_id)
    return getSur(state, sur_id)
}

function announceSurSaveFailedForSprintAndUser(sprint_id, user_id, error) {
    return {
        type: ANNOUNCE_SURS_SAVE_FAILED,
        error: error,
        received_at: Date.now(),
        sprint_id: sprint_id,
        user_id: user_id
    }
}

function announceSursSavedForSprintAndUser(sprint_id, user_id) {
    return {
        type: ANNOUNCE_SURS_SAVED,
        sprint_id: sprint_id,
        user_id: user_id,
        saved_at: Date.now()
    }
}

function announceSursSavingForSprintAndUser(sprint_id, user_id) {
    return {
        type: ANNOUNCE_SURS_SAVING,
        sprint_id: sprint_id,
        user_id: user_id,
    }
}

export function updateSprintUserRates(sprint_ids, user_ids, rate_values, on_done) {
    return (dispatch, getState) => {
        const state = getState()
	dispatch(announceSursSavingForSprintAndUser(sprint_ids[0], user_ids[0]))
	let data = {sprint_ids: sprint_ids,
                    user_ids: user_ids,
                    rate_values: rate_values}

	return impfetch(state, "imp/rate/sprint/", dispatch,
			{method: "POST",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"},
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceSurSaveFailedForSprintAndUser(sprint_ids[0], user_ids[0], json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
                 dispatch(announceSursSavedForSprintAndUser(sprint_ids[0], user_ids[0]))
             }
	     if ( on_done ) {
		 on_done()
	     }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceSurSaveFailedForSprintAndUser(sprint_ids[0], user_ids[0], error))
	 })
    }
}
