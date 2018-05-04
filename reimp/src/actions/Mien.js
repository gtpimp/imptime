import cookie from 'react-cookie';
import { get } from 'lodash'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    getItemsById,
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
    getLoadingItemIds
} from '../actions/Item'
import { getAllAvailableIssueHeaders } from './Issues'

export const SET_MIEN_BUTTON = 'SET_MIEN_BUTTON'
export const SET_MIEN = 'SET_MIEN'
export const START_MIEN_CONFIGURER = 'START_MIEN_CONFIGURER'
export const STOP_MIEN_CONFIGURER = 'STOP_MIEN_CONFIGURER'

import { ENTITY_KEY__MIEN } from './ItemListKeyRegistry'

export const MIENS = ['dev', 'reviewer', 'finance', 'client', 'tester', 'spec']

const MIEN_FEATURES = { 'spec':
                        {
                            'multiple_issue_summary': true,
                        },

                        'dev':
                        {
                            'emacs': true,
                        },
                        
                        'reviewer':
                        {
                            'review_schedule': true,
                            'sidebar_issue_estimates': true
                        },

                        'finance':
                        {
                            'multiple_issue_summary': true,
                            'costs': true
                        },

                        'client':
                        {
                            'deadlines': true
                        }
                        
}

export function getCurrentMien(state) {
    const mien_id = getCurrentMienId(state)
    return getMien(state, mien_id)
}

export function getCurrentMienId(state) {
    if ( cookie.load("current_mien") ) {
        return cookie.load("current_mien") || "dev_mien"
    } else {
        return get(state.settings, ["mien"], "dev_mien")
    }
}

export function setCurrentMienId(mien_id) {

    cookie.save("current_mien", mien_id, {path: "/"})
    return {
        type: SET_MIEN,
        mien: mien_id
    }
}

export function getIssueHeaderListForCurrentMien(state) {
    const mien = getCurrentMien(state)
    return get(mien, ["issue_headers"], null) || getAllAvailableIssueHeaders()
}

export function doesMienHaveFeature(state, feature_name) {
    const mien_id = getCurrentMienId(state)
    return get(MIEN_FEATURES, [mien_id, feature_name], false)
}

export function invalidateAllMiens() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__MIEN))
    }
}

export function invalidateMiens(mien_ids) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__MIEN, mien_ids
        ))
    }
}

export function fetchMiensIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__MIEN, list_key))
    }
}

export function ensureMiensLoaded(mien_ids) {
    return ensureItemsLoaded(ENTITY_KEY__MIEN, mien_ids)
}

export function getMien(state, mien_id) {
    return getItem(state, ENTITY_KEY__MIEN, mien_id)
}

export function getMiens(state, mien_ids) {
    return getItems(state, ENTITY_KEY__MIEN, mien_ids)
}

export function getMiensById(state, mien_ids) {
    return getItemsById(state, ENTITY_KEY__MIEN, mien_ids)
}

export function updateMienTitle(mien_id, value) {
    return updateItem(ENTITY_KEY__MIEN, [mien_id], "title", value)
}

export function startCandidateMien() {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__MIEN, {}))
    }
}

export function updateCandidateTitle(title) {
    return updateCandidateDetails(ENTITY_KEY__MIEN, {title:title})
}

export function cancelCandidateMien() {
    return cancelCandidateItem(ENTITY_KEY__MIEN)
}

export function saveCandidateMien(on_done) {
    return saveCandidateItem(ENTITY_KEY__MIEN, on_done)
}

export function deleteMiens(mien_ids) {
    return deleteItems(ENTITY_KEY__MIEN, mien_ids)
}

export function getCandidateMien(state) {
    return getCandidateItem(ENTITY_KEY__MIEN, state)
}

export function getInvalidatedMienIds(state, mien_ids) {
    return getInvalidatedItemIds(ENTITY_KEY__MIEN, state, mien_ids)
}

export function getLoadingMienIds(state, mien_ids) {
    return getLoadingItemIds(state, ENTITY_KEY__MIEN, mien_ids)
}

export function getSavingMienIds(state, mien_ids) {
    return getSavingItemIds(ENTITY_KEY__MIEN, state, mien_ids)
}

export function is_mien_invalidated(state, mien_id) {
    return is_item_invalidated(ENTITY_KEY__MIEN, state, mien_id)
}

export function startMienConfigurer() {
    return { type: START_MIEN_CONFIGURER }
}

export function stopMienConfigurer() {
    return { type: STOP_MIEN_CONFIGURER }
}

export function isMienConfigurerActive(state) {
    return get(state, [ "mien", "mien_configurer_active"], false)
}

export function getMienBeingConfigured(state) {
    if ( ! isMienConfigurerActive(state) ) {
        return null
    }
    return getCurrentMien(state)
}

