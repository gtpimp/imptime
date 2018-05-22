import { get } from 'lodash'
import { impfetch } from './lib.js'

export const ANNOUNCE_LOADING_BILLABLE_HOURS_STATEMENT = 'ANNOUNCE_LOADING_BILLABLE_HOURS_STATEMENT'
export const ANNOUNCE_BILLABLE_HOURS_STATEMENT_LOADED = 'ANNOUNCE_BILLABLE_HOURS_STATEMENT_LOADED'
export const ANNOUNCE_BILLABLE_HOURS_STATEMENT_LOAD_FAILED = 'ANNOUNCE_BILLABLE_HOURS_STATEMENT_LOAD_FAILED'
export const INVALIDATE_BILLABLE_HOURS_STATEMENT = 'INVALIDATE_BILLABLE_HOURS_STATEMENT'
export const UPDATE_BILLABLE_HOURS_STATEMENT_FILTER = 'UPDATE_BILLABLE_HOURS_STATEMENT_FILTER'

export function invalidateBillableHoursStatement() {
    return {
        type: INVALIDATE_BILLABLE_HOURS_STATEMENT
    }
}

function announceLoadingBillableHoursStatement() {
    return {
        type: ANNOUNCE_LOADING_BILLABLE_HOURS_STATEMENT
    }
}

function announceBillableHoursStatementLoaded(payload) {
    const billable_hours_statement = payload.billable_hours_statement
    return {
        type: ANNOUNCE_BILLABLE_HOURS_STATEMENT_LOADED,
        billable_hours_statement: billable_hours_statement,
	received_at: Date.now()
    }
}

function announceBillableHoursStatementLoadFailed(error) {
    return {
        type: ANNOUNCE_BILLABLE_HOURS_STATEMENT_LOAD_FAILED,
        error: error,
        received_at: Date.now()
    }
}

export function ensureBillableHoursStatementLoaded(override_filter) {
    return (dispatch, getState) => {
        const state = getState()
        const filter = override_filter || get_billable_hours_statement_filter(state)
        if ( isLoadingBillableHoursStatement(state) ) {
            return
        }
        if ( getBillableHoursStatement(state) === null ) {
            dispatch(fetchBillableHoursStatement(filter))
        }
    }
}

function fetchBillableHoursStatement(filter) {
    return (dispatch, getState) => {
        const state = getState()
        const params = { filter: filter }
	dispatch(announceLoadingBillableHoursStatement())
	return impfetch(state, 'imp/billable_hours_statement/', dispatch, {params:params})
            .then(response => response.json())
	    .then(json => {
                if (json.status !== 'success') {
		    dispatch(announceBillableHoursStatementLoadFailed(json.error))
                } else {
                    dispatch(announceBillableHoursStatementLoaded(json.payload))
                }
	    }).catch(function (error) {
		dispatch(announceBillableHoursStatementLoadFailed("Failed to load billable hours statment: " + error))
	    })
    }
}

export function getBillableHoursStatement(state) {
    return get(state, ["billable_hours_statement"], null)
}

export function isLoadingBillableHoursStatement(state) {
    return get(state, ["billable_hours_statement", "loading"], false)
}

export function update_billable_hours_statement_filter(date_from_inclusive, date_to_inclusive) {
    return (dispatch, getState) => {
        dispatch({
            type: UPDATE_BILLABLE_HOURS_STATEMENT_FILTER,
            date_from_inclusive: date_from_inclusive,
            date_to_inclusive: date_to_inclusive,
        })
    }
}

export function get_billable_hours_statement_filter(state) {
    return state.billable_hours_statement.filter
}
