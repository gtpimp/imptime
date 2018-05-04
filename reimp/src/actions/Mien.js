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

export const SET_MIEN_BUTTON = 'SET_MIEN_BUTTON'
export const SET_MIEN = 'SET_MIEN'

import { large_col_width, medium_col_width, small_col_width, tiny_col_width, ENTITY_KEY__MIEN } from './ItemListKeyRegistry'

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

export var ISSUE_HEADERS_BY_MIEN = { 'dev': {'number': {label:"#", width:tiny_col_width},
                                             'issue_type': {label:'', width:tiny_col_width},
                                             'attachment': {label:'', width:tiny_col_width},
                                             'expand_feature': {label:'', width:tiny_col_width},
                                             'name': {label:"Name", width:"auto", flex:1},
                                             'assignee': {label:"Assignee", width:medium_col_width},
                                             'created_at': {label:"Created at", width:medium_col_width},
                                             'status': {label:"Status", width:medium_col_width},
                                             'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                             'my_estimate': {label:"Estimates", width:small_col_width},
                                             'small_delete': {label:"", width:tiny_col_width}},
                                     'reviewer': {'number': {label:"#", width:tiny_col_width},
                                                  'issue_type': {label:'', width:tiny_col_width},
                                                  'attachment': {label:'', width:tiny_col_width},
                                                  'expand_feature': {label:'', width:tiny_col_width},
                                                  'name': {label:"Name", width:"auto", flex:1},
                                                  'assignee': {label:"Assignee", width:medium_col_width},
                                                  'created_at': {label:"Created at", width:medium_col_width},
                                                  'status': {label:"Status", width:medium_col_width},
                                                  'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                                  'small_delete': {label:"", width:tiny_col_width}},
                                     'finance': {'number': {label:"#", width:tiny_col_width},
                                                 'issue_type': {label:'', width:tiny_col_width},
                                                 'attachment': {label:'', width:tiny_col_width},
                                                 'expand_feature': {label:'', width:tiny_col_width},
                                                 'name': {label:"Name", width:"auto", flex:1},
                                                 'assignee': {label:"Assignee", width:medium_col_width},
                                                 'created_at': {label:"Created at", width:medium_col_width},
                                                 'status': {label:"Status", width:medium_col_width},
                                                 'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                                 'small_delete': {label:"", width:tiny_col_width}},
                                     'client': {'number': {label:"#", width:tiny_col_width},
                                                'issue_type': {label:'', width:tiny_col_width},
                                                'attachment': {label:'', width:tiny_col_width},
                                                'expand_feature': {label:'', width:tiny_col_width},
                                                'name': {label:"Name", width:"auto", flex:1},
                                                'assignee': {label:"Assignee", width:medium_col_width},
                                                'created_at': {label:"Created at", width:medium_col_width},
                                                'status': {label:"Status", width:medium_col_width},
                                                'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                                'small_delete': {label:"", width:tiny_col_width}},
                                     'tester': {'number': {label:"#", width:tiny_col_width},
                                                'issue_type': {label:'', width:tiny_col_width},
                                                'attachment': {label:'', width:tiny_col_width},
                                                'expand_feature': {label:'', width:tiny_col_width},
                                                'name': {label:"Name", width:"auto", flex:1},
                                                'assignee': {label:"Assignee", width:medium_col_width},
                                                'created_at': {label:"Created at", width:medium_col_width},
                                                'status': {label:"Status", width:medium_col_width},
                                                'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                                'small_delete': {label:"", width:tiny_col_width}},
                                     'spec': {'number': {label:"#", width:tiny_col_width},
                                              'issue_type': {label:'', width:tiny_col_width},
                                              'attachment': {label:'', width:tiny_col_width},
                                              'expand_feature': {label:'', width:tiny_col_width},
                                              'name': {label:"Name", width:large_col_width},
                                              'assignee': {label:"Assignee", width:medium_col_width},
                                              'status': {label:"Status", width:small_col_width},
                                              'estimate_summary': {label:"Time", width:medium_col_width},
                                              'tag_columns': {label:"Tag Columns", width:medium_col_width},
                                              'estimate_columns': {label:"Estimates", width:medium_col_width}}
}

export function getIssueHeaderListForCurrentMien(state) {
    return ISSUE_HEADERS_BY_MIEN[getCurrentMienId(state)]
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

export function doesMienHaveFeature(state, feature_name) {
    const mien_id = getCurrentMienId(state)
    return get(MIEN_FEATURES, [mien_id, feature_name], false)
}

// ////

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
