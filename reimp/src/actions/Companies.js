import { impfetch } from './lib.js'
import {
    ENTITY_KEY__COMPANY
} from './ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    getItemsById,
    getItemByRef,
    updateItem,
    startCandidateItem,
    saveCandidateItem,
    updateCandidateDetails,
    cancelCandidateItem,
    getCandidateItem,
    deleteItems,
    is_item_invalidated,
    getInvalidatedItemIds,
    getSavingItemIds,
    getLoadingItemIds,
    isLoadingItems
} from '../actions/Item'
import {
    ANNOUNCE_SAVED_INVITE,
    ANNOUNCE_SAVE_INVITE_FAILED,
    ANNOUNCE_SAVING_INVITE
} from './Projects'

export const SET_COMPANY_STORE_VALUE = 'SET_COMPANY_STORE_VALUE'

export const ALL_AVAILABLE_COMPANY_HEADERS = [ {key:'name', label:"Name", description:"Company name", width:"auto", flex:1, is_default: true}
]


export function invalidateAllCompanies() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__COMPANY))
    }
}

export function invalidateCompanies(company_ids) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__COMPANY, company_ids
        ))
    }
}

export function fetchCompaniesIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__COMPANY, list_key))
    }
}

export function ensureCompaniesLoaded(company_ids) {
    return ensureItemsLoaded(ENTITY_KEY__COMPANY, company_ids)
}

export function getCompanyByRef(state, ref) {
    return getItemByRef(state, ENTITY_KEY__COMPANY, ref)
}

export function getCompany(state, company_id) {
    return getItem(state, ENTITY_KEY__COMPANY, company_id)
}

export function getCompanies(state, company_ids) {
    return getItems(state, ENTITY_KEY__COMPANY, company_ids)
}

export function getCompaniesById(state, company_ids) {
    return getItemsById(state, ENTITY_KEY__COMPANY, company_ids)
}

export function updateCompanyName(company_id, value) {
    return updateItem(ENTITY_KEY__COMPANY, [company_id], "name", value)
}

export function startCandidateCompany() {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__COMPANY, {}))
    }
}

export function updateCandidateName(name) {
    return updateCandidateDetails(ENTITY_KEY__COMPANY, {name:name})
}

export function updateCandidateProperties(props) {
    return updateCandidateDetails(ENTITY_KEY__COMPANY, props)
}

export function cancelCandidateCompany() {
    return cancelCandidateItem(ENTITY_KEY__COMPANY)
}

export function saveCandidateCompany(on_done) {
    return saveCandidateItem(ENTITY_KEY__COMPANY, on_done)
}

export function deleteCompanies(company_ids) {
    return deleteItems(ENTITY_KEY__COMPANY, company_ids)
}

export function getCandidateCompany(state) {
    return getCandidateItem(ENTITY_KEY__COMPANY, state)
}

export function getInvalidatedCompanyIds(state, company_ids) {
    return getInvalidatedItemIds(ENTITY_KEY__COMPANY, state, company_ids)
}

export function getLoadingCompanyIds(state, company_ids) {
    return getLoadingItemIds(state, ENTITY_KEY__COMPANY, company_ids)
}

export function getSavingCompanyIds(state, company_ids) {
    return getSavingItemIds(ENTITY_KEY__COMPANY, state, company_ids)
}

export function is_company_invalidated(state, company_id) {
    return is_item_invalidated(ENTITY_KEY__COMPANY, state, company_id)
}

export function isLoadingCompanies(state, item_ids) {
    return isLoadingItems(state, ENTITY_KEY__COMPANY, item_ids)
}

function announceSavingInvite(user_email, company_id) {
    return {
        type: ANNOUNCE_SAVING_INVITE,
        user_email: user_email,
        company_id: company_id
    }
}

function announceInviteSaved(user_email, company_id, payload) {
    return {
        type: ANNOUNCE_SAVED_INVITE,
        user_email: user_email,
        company_id: company_id,
        payload: payload
    }
}

function announceInviteSaveFailed(user_email, company_id, error) {
    return {
        type: ANNOUNCE_SAVE_INVITE_FAILED,
        user_email: user_email,
        company_id: company_id,
        error: error
    }
}

export function saveInviteUser(company_id, user_email) {

    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceSavingInvite())
	let data = {user_email: user_email}

	return impfetch(state, "imp/company/"+company_id+"/invite/", dispatch,
			{method: "POST",
			 credentials: 'same-origin',
			 data: data,
			 headers: {"Content-type": "application/json; charset=UTF-8"},
			 body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
		 dispatch(announceInviteSaveFailed(user_email, company_id, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceInviteSaved(user_email, company_id, json.payload))
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
	     dispatch(announceInviteSaveFailed(user_email, company_id, error))
	 })
    }

}
