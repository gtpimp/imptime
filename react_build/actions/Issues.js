import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import map from 'lodash/map'
import { fetchListIfNeeded } from './ItemList'

export const ANNOUNCE_ISSUES_LOADED = 'ANNOUNCE_ISSUES_LOADED'
export const ANNOUNCE_ISSUES_LOAD_FAILED = 'ANNOUNCE_ISSUES_LOAD_FAILED'
export const ANNOUNCE_LOADING_ISSUES = 'ANNOUNCE_LOADING_ISSUES'
export const INVALIDATE_ISSUES = 'INVALIDATE_ISSUES'

// Commented out because you almost never need this, usually rather call invalidate_list on ItemList.
/* export function invalidateIssues() {
 *     return {
 *         type: INVALIDATE_ISSUES
 *     }
 * }*/

function announceLoadingIssues() {
    return {
        type: ANNOUNCE_LOADING_ISSUES
    }
}

export function refreshIssues(list_key) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(list_key))
        dispatch(fetchItems(list_key))
    }
}

function announceIssuesLoaded(payload) {

    let items_by_id = {}
    payload.issues.map((item, index) => {
        items_by_id[item.id] = item
    });
    
    return {
        type: ANNOUNCE_ISSUES_LOADED,
        items_by_id: items_by_id,
	received_at: Date.now()
    }
}

function announceIssuesLoadFailed(error_message) {
    return {
        type: ANNOUNCE_ISSUES_LOAD_FAILED,
        error_message: error_message,
        receivedAt: Date.now()
    }
}

function fetchIssuesPromise(dispatch, issue_ids) {
    return new Promise(function(resolve, reject) {
	dispatch(announceLoadingIssues())

	const params = { filter: { ids: issue_ids },
			 pagination: {'enabled': false} }
	
        return impfetch('/imp/issue/', {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status != 'success') {
		    dispatch(announceIssuesLoadFailed())
		    reject(json.error_message)
                } else {
		    dispatch(announceIssuesLoaded(json.payload))
                }
	    }).catch(function (error) {
		dispatch(announceIssuesLoadFailed("Failed to load issues: " + error.message))
		reject("Failed to load issues: " + error.message)
	    })
    })
}

export function fetchIssuesIfNeeded(list_key) {
    const matching_items_key = 'issue'
    const matching_items_promise_func = fetchIssuesPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}
