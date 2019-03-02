import cookie from 'react-cookies';
import { get, keys, includes } from 'lodash'
import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    getAllItems,
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
    getLoadingItemIds,
    customUpdate
} from '../actions/Item'
import { customUpdateMienHeaders } from '../reducers/mien'
import { has_permission } from './Users'
import { ENTITY_KEY__MIEN } from './ItemListKeyRegistry'

export const SET_MIEN_BUTTON = 'SET_MIEN_BUTTON'
export const SET_MIEN = 'SET_MIEN'
export const START_MIEN_CONFIGURER = 'START_MIEN_CONFIGURER'
export const STOP_MIEN_CONFIGURER = 'STOP_MIEN_CONFIGURER'

const DEFAULT_MIEN_FEATURES = [ "emacs", "issue_estimates", "issue_reviews", "review_schedule", "deadlines", "costs" ]

export function showMoney(state, project_id) {
    // Because money comes up a lot, this is a helper function.
    // If this function returns True, it's absolutely ok to show money.
    // If this function returns False, do not under any circumstances show money.
    return doesMienHaveFeature(state, 'costs') && project_id && has_permission(state, project_id, 'has_view_ctc_billable_rates')
}

export function getCurrentMien(state) {
    const mien_id = getCurrentMienId(state)
    let mien = getMien(state, mien_id)
    if ( ! mien ) {
        return getDefaultMien(state)
    }
    return mien
}

export function getCurrentMienId(state) {
    var mien_id = cookie.load("current_mien")
    if ( ! mien_id ) {
        return get(getDefaultMien(state), ["id"], null)
    }
    return mien_id
}

function getDefaultMien(state) {
    const all_miens = getAllItems(state, ENTITY_KEY__MIEN)
    if ( all_miens ) {
        const mien_keys = keys(all_miens)
        if ( mien_keys.length === 0 ) {
            return null
        }
        const mien = all_miens[mien_keys[0]]
        setCurrentMienId(mien.id)
        return mien
    }
    return null
}

export function setCurrentMienId(mien_id) {

    cookie.save("current_mien", mien_id, {path: "/"})
    return {
        type: SET_MIEN,
        mien: mien_id
    }
}

export function getHeaderListForMien(mien, name) {
    return get(mien, ["headers", name], null)
}

export function getHeaderListForCurrentMien(state, name) {
    const mien = getCurrentMien(state)
    return getHeaderListForMien(mien, name)
}

export function doesMienHaveFeature(state, feature_name) {
    const mien = getCurrentMien(state)
    if ( !mien ) {
        return false
    }
    let features = mien.features
    if ( features === undefined ) {
        features = DEFAULT_MIEN_FEATURES
    }
    return includes(features, feature_name)
}

export function doesMienHaveHeader(state, header_list_name, name) {
    const mien = getCurrentMien(state)
    if ( !mien ) {
        return true
    }
    let headers = mien.headers[header_list_name]
    if ( headers === undefined ) {
        return true
    }
    return includes(headers, name)
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

export function updateMienHeaders(mien_id, name, headers) {
    return (dispatch, getState) => {
        dispatch(customUpdate(ENTITY_KEY__MIEN, customUpdateMienHeaders,
                              {headers: headers, name: name, mien_id: mien_id}))
        dispatch(updateItem(ENTITY_KEY__MIEN, [mien_id], "headers", {'name':name, 'headers':headers}))
    }
}

export function updateMienFeature(mien_id, feature_name, is_enabled) {
    const new_value = { feature_name: feature_name,
                        is_enabled: is_enabled }
    return updateItem(ENTITY_KEY__MIEN, [mien_id], "feature", new_value)
}

export function startCandidateMien(initial_candidate_props) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__MIEN, initial_candidate_props || {}))
    }
}

export function updateCandidateTitle(title) {
    return updateCandidateDetails(ENTITY_KEY__MIEN, {title:title})
}

export function updateCandidateCloneOf(clone_of_mien_id) {
    return updateCandidateDetails(ENTITY_KEY__MIEN, {clone_of_mien_id:clone_of_mien_id})
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

