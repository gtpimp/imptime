import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import map from 'lodash/map'
import { fetchListIfNeeded } from './ItemList'

export const ANNOUNCE_SPRINTS_LOADED = 'ANNOUNCE_SPRINTS_LOADED'
export const ANNOUNCE_SPRINTS_LOAD_FAILED = 'ANNOUNCE_SPRINTS_LOAD_FAILED'
export const ANNOUNCE_LOADING_SPRINTS = 'ANNOUNCE_LOADING_SPRINTS'
export const INVALIDATE_SPRINTS = 'INVALIDATE_SPRINTS'

// Commented out because you almost never need this, usually rather call invalidate_list on ItemList.
/* export function invalidateSprints() {
 *     return {
 *         type: INVALIDATE_SPRINTS
 *     }
 * }*/

function announceLoadingSprints() {
    return {
        type: ANNOUNCE_LOADING_SPRINTS
    }
}

export function refreshSprints(list_key) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(list_key))
        dispatch(fetchItems(list_key))
    }
}

function announceSprintsLoaded(payload) {

    let items_by_id = {}
    payload.sprints.map((item, index) => {
        items_by_id[item.id] = item
    });
    
    return {
        type: ANNOUNCE_SPRINTS_LOADED,
        items_by_id: items_by_id,
	received_at: Date.now()
    }
}

function announceSprintsLoadFailed(error_message) {
    return {
        type: ANNOUNCE_SPRINTS_LOAD_FAILED,
        error_message: error_message,
        received_at: Date.now()
    }
}

function fetchSprintsPromise(dispatch, sprint_ids) {
    return new Promise(function(resolve, reject) {
	dispatch(announceLoadingSprints())

	const params = { filter: { ids: sprint_ids },
			 pagination: {'enabled': false} }
	
        return impfetch('/imp/sprint/', {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status != 'success') {
		    dispatch(announceSprintsLoadFailed())
		    reject(json.error_message)
                } else {
		    dispatch(announceSprintsLoaded(json.payload))
                }
	    }).catch(function (error) {
		dispatch(announceSprintsLoadFailed("Failed to load sprints: " + error.message))
		reject("Failed to load sprints: " + error.message)
	    })
    })
}

export function fetchSprintsIfNeeded(list_key) {
    const matching_items_key = 'sprint'
    const matching_items_promise_func = fetchSprintsPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}
