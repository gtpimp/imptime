import { setErrorMessage } from '../actions/Error'

import {
    ANNOUNCE_BILLABLE_HOURS_STATEMENT_LOAD_FAILED,
    ANNOUNCE_BILLABLE_HOURS_STATEMENT_LOADED,
    ANNOUNCE_LOADING_BILLABLE_HOURS_STATEMENT,
    INVALIDATE_BILLABLE_HOURS_STATEMENT,
    UPDATE_BILLABLE_HOURS_STATEMENT_FILTER
} from '../actions/BillableHoursStatement.js'

const initialState = {
    filter: {},
    invalidated: false,
    loading: false
}

export default function billable_hours_statement(state = initialState, action) {

    switch (action.type) {
        case INVALIDATE_BILLABLE_HOURS_STATEMENT:
            return Object.assign({}, state, {invalidated: true})

        case ANNOUNCE_LOADING_BILLABLE_HOURS_STATEMENT:
            return Object.assign({}, state, {loading: true})
            
        case ANNOUNCE_BILLABLE_HOURS_STATEMENT_LOADED:
            return Object.assign({}, state, {
                loading: false,
                received_at: action.received_at,
                billable_hours_statement: action.billable_hours_statement
	    })
            
        case ANNOUNCE_BILLABLE_HOURS_STATEMENT_LOAD_FAILED:
            setErrorMessage("Failed to load project statement: " + action.error_message)
            return state;

        case UPDATE_BILLABLE_HOURS_STATEMENT_FILTER:
            // note: one filter for all projects, which seems more
            // natural than every project having its own filter
            return Object.assign({},
                                 state,
                                 { filter: Object.assign({},
                                                         state.filter,
                                                         { date_from_inclusive: action.date_from_inclusive,
                                                           date_to_inclusive: action.date_to_inclusive })
                                 })

        default:
            return state
    }
}
