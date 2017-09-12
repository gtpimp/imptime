import includes from 'lodash/includes'
import { impfetch, download } from './lib.js'

export const ANNOUNCE_LOADING_TIME_CHART = 'ANNOUNCE_LOADING_TIME_CHART'
export const ANNOUNCE_TIME_CHART_LOADED = 'ANNOUNCE_TIME_CHART_LOADED'
export const ANNOUNCE_TIME_CHART_LOAD_FAILED = 'ANNOUNCE_TIME_CHART_LOAD_FAILED'
export const INVALIDATE_TIME_CHART = 'INVALIDATE_TIME_CHART'

export function invalidateTimeChart(project_id) {
    project_id = parseInt(project_id)
    return {
        type: INVALIDATE_TIME_CHART,
	      project_id_to_invalidate: project_id
    }
}

function announceLoadingTimeChart(project_id) {
    project_id = parseInt(project_id)
    return {
        type: ANNOUNCE_LOADING_TIME_CHART,
	project_id_to_load: project_id
    }
}

function announceTimeChartLoaded(payload) {
    const time_chart = payload.time_chart
    return {
        type: ANNOUNCE_TIME_CHART_LOADED,
        time_chart: time_chart,
        project_id: parseInt(time_chart.project_id),
	received_at: Date.now()
    }
}

function announceTimeChartLoadFailed(error) {
    return {
        type: ANNOUNCE_TIME_CHART_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

export function ensureTimeChartLoaded(project_id, filter) {
    project_id = parseInt(project_id)
    return (dispatch, getState) => {
        const state = getState()
        if ( isLoadingTimeChart(state, project_id) ) {
            return
        }
        if ( getTimeChart(state, project_id) === null ) {
            dispatch(fetchTimeChart(project_id, filter))
        }
    }
}

function fetchTimeChart(project_id, filter) {
    project_id = parseInt(project_id)
    return (dispatch, getState) => {
        const state = getState()
        const params = { filter: filter }
	dispatch(announceLoadingTimeChart(project_id))
	return impfetch(state, 'imp/time_chart/'+project_id+'/times_per_user_for_project/', dispatch, {params:params})
            .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceTimeChartLoadFailed(json.error))
                } else {
                    dispatch(announceTimeChartLoaded(json.payload))
                }
	    }).catch(function (error) {
		dispatch(announceTimeChartLoadFailed("Failed to load time chart: " + error))
	    })
    }
}

export function getTimeChart(state, project_id) {
    project_id = parseInt(project_id)
    return ((state.time_chart || {}).items_by_project_id || {})[project_id] || null
}

export function isLoadingTimeChart(state, project_id) {
    project_id = parseInt(project_id)
    const loading_ids = (state.time_chart || {}).loading_project_ids || []
    return includes(loading_ids, project_id)
}
