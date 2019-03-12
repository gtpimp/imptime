import { impfetch } from './lib.js'
import keyBy from 'lodash/keyBy'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { ENTITY_KEY__WORK_SUMMARY } from '../actions/ItemListKeyRegistry'

export const ANNOUNCE_SUMMARIES_LOADED = 'ANNOUNCE_SUMMARIES_LOADED'
export const ANNOUNCE_SUMMARIES_LOAD_FAILED = 'ANNOUNCE_SUMMARIES_LOAD_FAILED'
export const ANNOUNCE_LOADING_SUMMARIES = 'ANNOUNCE_LOADING_SUMMARIES'
export const INVALIDATE_SUMMARIES = 'INVALIDATE_SUMMARIES'
export const INVALIDATE_ALL_SUMMARIES = 'INVALIDATE_ALL_SUMMARIES'

export function invalidateAllSummaries() {
    return {
        type: INVALIDATE_ALL_SUMMARIES
    }
}

export function invalidateSummaries(project_ids) {
    return {
        type: INVALIDATE_SUMMARIES,
	project_ids_to_invalidate: project_ids
    }
}

function announceLoadingSummaries(project_ids) {
    return {
        type: ANNOUNCE_LOADING_SUMMARIES,
	project_ids_to_load: project_ids
    }
}

function announceSummariesLoaded(payload) {
    return {
        type: ANNOUNCE_SUMMARIES_LOADED,
        items_by_id: keyBy(payload.summaries, 'id'),
        all_issue_ids: payload.all_issue_ids,
        all_sprint_ids: payload.all_sprint_ids,
        all_project_ids: payload.all_project_ids,
        all_user_ids: payload.all_user_ids,
	received_at: Date.now()
    }
}

function announceSummariesLoadFailed(error) {
    return {
        type: ANNOUNCE_SUMMARIES_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

function fetchSummariesPromise(dispatch, state, project_ids) {
    return new Promise(function(resolve, reject) {
	      dispatch(announceLoadingSummaries(project_ids))

	const params = { filter: { ids: project_ids },
			 pagination: {'enabled': false} }

        return impfetch(state, 'imp/work_summary/', dispatch, {params:params})
	          .then(response => response.json())
	          .then(json => {
                if (json.status !== 'success') {
		                dispatch(announceSummariesLoadFailed())
		                reject(json.error)
                } else {
		    dispatch(announceSummariesLoaded(json.payload))
		    resolve(json.payload)
                }
	          }).catch(function (error) {
		            dispatch(announceSummariesLoadFailed("Failed to load project summaries: " + error))
		            reject("Failed to load project summaries: " + error)
	          })
    })
}

export function fetchSummariesIfNeeded(list_key) {
    const matching_items_key = ENTITY_KEY__WORK_SUMMARY
    const matching_items_promise_func = fetchSummariesPromise
    return fetchListIfNeeded(list_key, matching_items_key, matching_items_promise_func)
}

export function ensureSummariesLoaded(project_ids) {
    return (dispatch, getState) => {
        const state = getState()
        const project_ids_to_load = getMissingItemIds(state, project_ids, ENTITY_KEY__WORK_SUMMARY)
        if ( project_ids_to_load.length > 0 ) {
            fetchSummariesPromise(dispatch, state, project_ids_to_load)
        }
    }
}

export function getSummary(state, project_id) {
    return ((state[ENTITY_KEY__WORK_SUMMARY] || {}).items_by_id || {})[project_id] || null
}

export function getSummaries(state, project_ids) {
    const project_objs = state[ENTITY_KEY__WORK_SUMMARY]
    const items_by_id = (project_objs && project_objs.items_by_id) || {}
    return items_by_id && project_ids && project_ids.map(function (project_id, index) {
        return items_by_id[project_id] || {
            'id': project_id,
            'loaded': false
        }
    })
}

export function getAllProjectIds(state) {
    const project_objs = state[ENTITY_KEY__WORK_SUMMARY] || {}
    return project_objs.all_project_ids || []
}

export function getAllSprintIds(state) {
    const project_objs = state[ENTITY_KEY__WORK_SUMMARY] || {}
    return project_objs.all_sprint_ids || []
}

export function getAllUserIds(state) {
    const project_objs = state[ENTITY_KEY__WORK_SUMMARY] || {}
    return project_objs.all_user_ids || []
}

export function getAllIssueIds(state) {
    const project_objs = state[ENTITY_KEY__WORK_SUMMARY] || {}
    return project_objs.all_issue_ids || []
}


