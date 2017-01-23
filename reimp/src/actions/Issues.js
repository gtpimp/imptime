import { impfetch } from './lib.js'
import difference from 'lodash/difference'
import keys from 'lodash/keys'
import map from 'lodash/map'
import { fetchListIfNeeded } from './ItemList'
import { ENTITY_KEY__ISSUE } from '../actions/ItemListKeyRegistry'
import { API_BASE_URL } from '../settings'

export const ANNOUNCE_ISSUES_LOADED = 'ANNOUNCE_ISSUES_LOADED'
export const ANNOUNCE_ISSUES_LOAD_FAILED = 'ANNOUNCE_ISSUES_LOAD_FAILED'
export const ANNOUNCE_LOADING_ISSUES = 'ANNOUNCE_LOADING_ISSUES'
export const INVALIDATE_ISSUES = 'INVALIDATE_ISSUES'
export const INVALIDATE_ALL_ISSUES = 'INVALIDATE_ALL_ISSUES'

export function invalidateAllIssues() {
    return {
        type: INVALIDATE_ALL_ISSUES
    }
}

export function invalidateIssues(issue_ids) {
    return {
        type: INVALIDATE_ISSUES,
	issue_ids_to_invalidate: issue_ids
    }
}

function announceLoadingIssues(issue_ids) {
    return {
        type: ANNOUNCE_LOADING_ISSUES,
	issue_ids_to_load: issue_ids
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

function announceIssuesLoadFailed(error) {
    return {
        type: ANNOUNCE_ISSUES_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function fetchIssuesPromise(dispatch, issue_ids) {
    return new Promise(function(resolve, reject) {
	dispatch(announceLoadingIssues(issue_ids))

	const params = { filter: { ids: issue_ids },
			 pagination: {'enabled': false} }
	
        return impfetch(API_BASE_URL+'imp/issue/', {params:params})
	    .then(response => response.json())
	    .then(json => {
                if (json.status != 'success') {
		    dispatch(announceIssuesLoadFailed())
		    reject(json.error)
                } else {
		    dispatch(announceIssuesLoaded(json.payload))
		    resolve(json.payload)
                }
	    }).catch(function (error) {
		dispatch(announceIssuesLoadFailed("Failed to load issues: " + error.message))
		reject("Failed to load issues: " + error.message)
	    })
    })
}

export function fetchIssuesIfNeeded(list_key) {
    const matching_items_key = ENTITY_KEY__ISSUE
    const matching_items_promise_func = fetchIssuesPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}
