import assign from 'lodash/assign'
import keys from 'lodash/keys'
import union from 'lodash/union'
import difference from 'lodash/difference'
import without from 'lodash/without'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_PROJECT_DASHBOARDS_LOADED,
    ANNOUNCE_PROJECT_DASHBOARDS_LOAD_FAILED,
    ANNOUNCE_LOADING_PROJECT_DASHBOARDS,
    INVALIDATE_PROJECT_DASHBOARDS,
    INVALIDATE_ALL_PROJECT_DASHBOARDS,
} from '../actions/ProjectDashboards.js'

const initialState = {
    items_by_id: {},
    loading_item_ids: [],
    saving_item_ids: [],
    all_sprint_ids: [],
    all_user_ids: []
}

export default function project_dashboard(state = initialState, action) {

    let state_copy = Object.assign({}, state)

    switch (action.type) {
	case INVALIDATE_ALL_PROJECT_DASHBOARDS:
	          return Object.assign({}, state, {items_by_id: null})

        case INVALIDATE_PROJECT_DASHBOARDS:
            return Object.assign({}, state, {items_by_id: without(state.items_by_id, action.project_ids_to_invalidate)})

        case ANNOUNCE_LOADING_PROJECT_DASHBOARDS:
	          return Object.assign({}, state, {
		            loading_item_ids: union(state.loading_item_ids, action.project_ids_to_load)
	          })
        case ANNOUNCE_PROJECT_DASHBOARDS_LOADED:
            state_copy = Object.assign({}, state, {
		loading_item_ids: Object.assign({},
						difference(state.loading_item_ids || [],
							   keys(action.items_by_id))),
		items_by_id: Object.assign({},
					   assign(state.items_by_id, action.items_by_id)),
                all_sprint_ids: action.all_sprint_ids,
                all_project_ids: action.all_project_ids,
                all_user_ids: action.all_user_ids
	    })
            state_copy.items_by_id = Object.assign({}, assign(state_copy.items_by_id, action.items_by_id))
            return state_copy
            
        case ANNOUNCE_PROJECT_DASHBOARDS_LOAD_FAILED:
            setErrorMessage("Failed to load projects dashboards: " + action.error_message)
            return state;

        default:
            return state
    }
}
