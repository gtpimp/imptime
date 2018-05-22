import union from 'lodash/union'
import difference from 'lodash/difference'
import without from 'lodash/without'
import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_PROJECT_STATEMENT_LOAD_FAILED,
    ANNOUNCE_PROJECT_STATEMENT_LOADED,
    ANNOUNCE_LOADING_PROJECT_STATEMENT,
    INVALIDATE_PROJECT_STATEMENT,
    UPDATE_PROJECT_STATEMENT_FILTER
} from '../actions/ProjectStatement.js'

const initialState = {
    items_by_project_id: {},
    filter: {},
    loading_project_ids: []
}

export default function project_statement(state = initialState, action) {

    let state_copy

    switch (action.type) {
        case INVALIDATE_PROJECT_STATEMENT:
            return Object.assign({}, state, {items_by_project_id: without(state.items_by_project_id, action.project_id_to_invalidate)})

        case ANNOUNCE_LOADING_PROJECT_STATEMENT:
	          return Object.assign({}, state, {
		            loading_project_ids: union(state.loading_project_ids, [action.project_id_to_load])
	          })
        case ANNOUNCE_PROJECT_STATEMENT_LOADED:
            state_copy = Object.assign({}, state, {
		loading_project_ids: Object.assign({},
						   difference(state.loading_project_ids || [],
							      [action.project_id])),
                items_by_project_id: Object.assign({}, state.items_by_project_id)
	    })
            action.project_statement.received_at = action.received_at
            state_copy.items_by_project_id[action.project_id] = Object.assign({}, action.project_statement)
            return state_copy
        case ANNOUNCE_PROJECT_STATEMENT_LOAD_FAILED:
            setErrorMessage("Failed to load project statement: " + action.error_message)
            return state;

        case UPDATE_PROJECT_STATEMENT_FILTER:
            // note: one filter for all projects, which seems more
            // natural than every project having its own filter
            return Object.assign({},
                                 state,
                                 { filter: Object.assign({},
                                                         state.filter,
                                                         { date_from_inclusive: action.date_from_inclusive,
                                                           date_to_inclusive: action.date_to_inclusive,
                                                           sprint_ids: action.sprint_ids })
                                 })

        default:
            return state
    }
}
