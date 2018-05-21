import { impfetch } from './lib.js'
import { ENTITY_KEY__COMPANY_PROBLEM } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    updateItem,
    startCandidateItem,
    saveCandidateItem,
    deleteItems,
    announceItemSaveFailed,
    announceItemsSaved,
    announceItemsSaving
} from '../actions/Item'

export function invalidateAllCompanyProblems() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__COMPANY_PROBLEM))
    }
}

export function invalidateCompanyProblems(company_problem_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__COMPANY_PROBLEM,
                                 company_problem_ids_to_invalidate
        ))
    }
}

export function updateCompanyProblem(company_problem_ids, field_name, new_value, on_done) {
    return updateItem(ENTITY_KEY__COMPANY_PROBLEM, company_problem_ids, field_name, new_value, on_done)
}

export function fetchCompanyProblemsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__COMPANY_PROBLEM, list_key))
    }
}

export function ensureCompanyProblemsLoaded(company_problem_ids) {
    return ensureItemsLoaded(ENTITY_KEY__COMPANY_PROBLEM, company_problem_ids)
}

export function getCompanyProblem(state, company_problem_id) {
    return getItem(state, ENTITY_KEY__COMPANY_PROBLEM, company_problem_id)
}

export function getCompanyProblems(state, company_problem_ids) {
    return getItems(state, ENTITY_KEY__COMPANY_PROBLEM, company_problem_ids)
}

export function createCompanyProblem(header, content) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__COMPANY_PROBLEM, { header: header,
                                                                   content: content }))
        dispatch(saveCandidateItem(ENTITY_KEY__COMPANY_PROBLEM))
    }
}

export function deleteCompanyProblem(company_problem_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__COMPANY_PROBLEM, [company_problem_id]))
    }
}

export function recalculateCompanyProblems() {
    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceItemsSaving(ENTITY_KEY__COMPANY_PROBLEM, []))
	let data = {}
	return impfetch( state, "imp/" + ENTITY_KEY__COMPANY_PROBLEM + "/recalculate/", dispatch,
			 {method: "POST",
			  credentials: 'same-origin',
			  data: data,
			  headers: {"Content-type": "application/json; charset=UTF-8"},
			  body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
                 dispatch(announceItemSaveFailed(ENTITY_KEY__COMPANY_PROBLEM, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceItemsSaved(ENTITY_KEY__COMPANY_PROBLEM, []))
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
             dispatch(announceItemSaveFailed(ENTITY_KEY__COMPANY_PROBLEM, error))
	 })
    }
}
