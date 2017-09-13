import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import without from 'lodash/without'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_TIME_CHART_LOAD_FAILED,
    ANNOUNCE_TIME_CHART_LOADED,
    ANNOUNCE_LOADING_TIME_CHART,
    INVALIDATE_TIME_CHART
} from '../actions/TimeChart.js'

const initialState = {
    items_by_project_id: {},
    loading_project_ids: []
}

export default function time_chart(state = initialState, action) {

    let state_copy = Object.assign({}, state)
    let new_items_by_project_id = null

    switch (action.type) {
        case INVALIDATE_TIME_CHART:
            return Object.assign({}, state, {items_by_project_id: without(state.items_by_project_id, action.project_id_to_invalidate)})

        case ANNOUNCE_LOADING_TIME_CHART:
	          return Object.assign({}, state, {
		            loading_project_ids: union(state.loading_project_ids, [action.project_id_to_load])
	          })
        case ANNOUNCE_TIME_CHART_LOADED:
            state_copy = Object.assign({}, state, {
		loading_project_ids: Object.assign({},
						   difference(state.loading_project_ids || [],
							      [action.project_id])),
                items_by_project_id: Object.assign({}, state.items_by_project_id)
	    })
            action.time_chart.received_at = action.received_at
            state_copy.items_by_project_id[action.project_id] = Object.assign({}, action.time_chart)
            return state_copy
        case ANNOUNCE_TIME_CHART_LOAD_FAILED:
            setErrorMessage("Failed to load time chart: " + action.error_message)
            return state;

        default:
            return state
    }
}
