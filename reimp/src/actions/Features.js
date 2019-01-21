import { impfetch } from './lib.js'

import { updateVisibleItemIdAbove } from './ItemList'
import {
    ENTITY_KEY__FEATURE,
    ENTITY_KEY__TAG
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
    itemPost,
    is_item_invalidated,
    getInvalidatedItemIds,
    getSavingItemIds,
    getLoadingItemIds,
    getTransientItemValue,
    setTransientItemValue
} from '../actions/Item'

export const SET_FEATURE_STORE_VALUE = 'SET_FEATURE_STORE_VALUE'
export const ANNOUNCE_BULK_CREATING_FEATURES = 'ANNOUNCE_BULK_CREATING_FEATURES'
export const ANNOUNCE_BULK_CREATING_FEATURES_FAILED = 'ANNOUNCE_BULK_CREATING_FEATURES_FAILED'
export const ANNOUNCE_BULK_CREATED_FEATURES = 'ANNOUNCE_BULK_CREATED_FEATURES'

export const ALL_AVAILABLE_FEATURE_HEADERS = [ {key:'number', label:"#", description:"Feature number", width:"50px"},
                                               {key:'name', label:"Name", description:"Feature subject", width:"auto", flex:1} 
]

export function invalidateAllFeatures() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__FEATURE))
    }
}

export function invalidateFeatures(feature_ids) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__FEATURE, feature_ids
        ))
    }
}

export function fetchFeaturesIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__FEATURE, list_key))
    }
}

export function ensureFeaturesLoaded(feature_ids) {
    return ensureItemsLoaded(ENTITY_KEY__FEATURE, feature_ids)
}

export function getFeatureByRef(state, ref) {
    return getItemByRef(state, ENTITY_KEY__FEATURE, ref)
}

export function getFeature(state, feature_id) {
    return getItem(state, ENTITY_KEY__FEATURE, feature_id)
}

export function getFeatures(state, feature_ids) {
    return getItems(state, ENTITY_KEY__FEATURE, feature_ids)
}

export function getFeaturesById(state, feature_ids) {
    return getItemsById(state, ENTITY_KEY__FEATURE, feature_ids)
}

export function updateFeatureName(feature_id, value) {
    return updateItem(ENTITY_KEY__FEATURE, [feature_id], "name", value)
}

export function updateFeatureDescription(feature_id, value) {
    return updateItem(ENTITY_KEY__FEATURE, [feature_id], "description", value)
}

export function updateFeaturePosition(feature_id, parent_feature_id, sibling_node_before_id) {
    return updateItem(ENTITY_KEY__FEATURE, [feature_id], "position",
                      {parent_id:parent_feature_id, sibling_node_before_id})
}

export function expandFeatureInTree(feature_id, expanded) {
    return setTransientItemValue(ENTITY_KEY__FEATURE, [feature_id], "expanded", expanded)
}

export function isFeatureExpanded(state, feature_id) {
    return getTransientItemValue(state, ENTITY_KEY__FEATURE, feature_id, "expanded") || false
}

export function collapseFeatureInTree(feature_id, collapsed) {
}

export function reorderFeature(moving_feature_ids, feature_id_after, list_key, index_of_destination, on_done) {
    return (dispatch, getState) => {
        dispatch(updateVisibleItemIdAbove(list_key, moving_feature_ids, feature_id_after, index_of_destination))
        dispatch(updateItem(ENTITY_KEY__FEATURE, moving_feature_ids, "feature_id_after", feature_id_after, on_done))
    }
}

export function startCandidateFeature(project_id, parent_feature_id) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__FEATURE,
                                    { parent_feature_id: parent_feature_id,
	                              project_id: project_id }))
    }
}

export function updateCandidateName(name) {
    return updateCandidateDetails(ENTITY_KEY__FEATURE, {name:name})
}

export function updateCandidateProperties(props) {
    return updateCandidateDetails(ENTITY_KEY__FEATURE, props)
}

export function cancelCandidateFeature() {
    return cancelCandidateItem(ENTITY_KEY__FEATURE)
}

export function saveCandidateFeature(on_done) {
    return saveCandidateItem(ENTITY_KEY__FEATURE, on_done)
}

export function deleteFeatures(feature_ids) {
    return deleteItems(ENTITY_KEY__FEATURE, feature_ids)
}

export function getCandidateFeature(state) {
    return getCandidateItem(ENTITY_KEY__FEATURE, state)
}

export function getInvalidatedFeatureIds(state, feature_ids) {
    return getInvalidatedItemIds(ENTITY_KEY__FEATURE, state, feature_ids)
}

export function getLoadingFeatureIds(state, feature_ids) {
    return getLoadingItemIds(state, ENTITY_KEY__FEATURE, feature_ids)
}

export function getSavingFeatureIds(state, feature_ids) {
    return getSavingItemIds(ENTITY_KEY__FEATURE, state, feature_ids)
}

export function is_feature_invalidated(state, feature_id) {
    return is_item_invalidated(ENTITY_KEY__FEATURE, state, feature_id)
}


function announceBulkCreatingFeatures(project_id) {
    return {
        type: ANNOUNCE_BULK_CREATING_FEATURES,
        project_id: project_id
    }
}

function announceBulkCreatedFeatures(project_id, new_feature_ids) {
    return {
        type: ANNOUNCE_BULK_CREATED_FEATURES,
        project_id: project_id,
        new_feature_ids: new_feature_ids
    }
}

function announceBulkCreatingFeaturesFailed(project_id, error) {
    return {
        type: ANNOUNCE_BULK_CREATING_FEATURES_FAILED,
        project_id: project_id,
        error: error
    }
}

export function bulkCreateFeatures(project_id, bulk_feature_text, opts, on_done) {
    return (dispatch, getState) => {
        const state = getState()
        dispatch(announceBulkCreatingFeatures(project_id))
        let data = { project_id: project_id,
                     bulk_feature_text: bulk_feature_text,
                     ...opts
        }
        return impfetch( state, "imp/feature/bulk_create_features/", dispatch,
                         {method: "POST",
                          credentials: 'same-origin',
                          data: data,
                          headers: {"Content-type": "application/json; charset=UTF-8"},
                          body: JSON.stringify(data)}
        ).then(response => response.json())
         .then(json => {
             if ( json.status !== 'success' ) {
                 console.log('Request failed with JSON response', json);
                 dispatch(announceBulkCreatingFeaturesFailed(project_id, json.error))
             } else {
                 console.log('Request succeeded with JSON response', json);
                 dispatch(announceBulkCreatedFeatures(project_id, json.payload.new_features_ids))
                 if ( on_done ) {
                     on_done(json.payload.new_feature_ids)
                 }
             }
         })
         .catch(function (error) {
             console.log('Request failed', error);
             dispatch(announceBulkCreatingFeaturesFailed(project_id, error))
         })
    }
}

export function addOrEditFeatureTag(tag_name, tag_category_name, feature_ids, tag_id) {
    const url = "imp/" + ENTITY_KEY__TAG + "/add_to_feature/"
    const field_name = "tags"
    const field_value = tag_name
    const method = "PUT"
    const data = { feature_ids: feature_ids,
                   tag_id: tag_id || null,
                   tag_name: tag_name,
                   tag_category_name: tag_category_name }
    return itemPost(ENTITY_KEY__FEATURE, feature_ids, url, field_name, field_value, method, data)
}

export function deleteTagFromFeatures(tag_id, feature_ids) {
    const url = "imp/" + ENTITY_KEY__TAG + "/" + tag_id + "/remove_from_features/"
    const field_name = "tags"
    const field_value = tag_id
    const method = "DELETE"
    const data = { feature_ids: feature_ids }
    return itemPost(ENTITY_KEY__FEATURE, feature_ids, url, field_name, field_value, method, data)
}

export function updateFeatureTestable(feature_id, testable_id, new_testable, name) {
    const url = "imp/issue/testable/0/"
    const field_name = "testable"
    const field_value = new_testable
    const method = "PUT"
    const data = { feature_id: feature_id,
                   testable_id: testable_id,
                   testable: new_testable,
                   name: name }
    return itemPost(ENTITY_KEY__FEATURE, [feature_id], url, field_name, field_value, method, data)
}

export function createFeatureTestable(feature_id, new_testable, name) {
    const url = "imp/issue/testable/"
    const field_name = "testable"
    const field_value = new_testable
    const method = "POST"
    const data = { feature_id: feature_id,
                   testable: new_testable,
                   name: name }
    return itemPost(ENTITY_KEY__FEATURE, [feature_id], url, field_name, field_value, method, data)
}

export function deleteFeatureTestable(feature_id, testable_id) {
    const url = "imp/issue/testable/0/"
    const field_name = "testable"
    const field_value = testable_id
    const method = "DELETE"
    const data = { feature_id: feature_id,
                   testable_id: testable_id }
    return itemPost(ENTITY_KEY__FEATURE, [feature_id], url, field_name, field_value, method, data)
}

export function addIssueToFeature_AutoCreateTestable(feature_id, issue_id) {
    const url = `imp/feature/${feature_id}/addIssueToFeatureTestableAutoCreate/`
    const field_name = "issue_id"
    const field_value = issue_id
    const method = "PUT"
    const data = { feature_id: feature_id,
                   issue_id: issue_id}
    return itemPost(ENTITY_KEY__FEATURE, [feature_id], url, field_name, field_value, method, data)
}

export function addIssueToFeatureTestable(feature_id, testable_id, issue_id) {
    const url = `imp/feature/${feature_id}/addIssueToFeatureTestable/`
    const field_name = "issue_id"
    const field_value = issue_id
    const method = "PUT"
    const data = { feature_id: feature_id,
                   testable_id: testable_id,
                   issue_id: issue_id}
    return itemPost(ENTITY_KEY__FEATURE, [feature_id], url, field_name, field_value, method, data)
}

export function removeIssueToFeatureTestable(feature_id, testable_id, issue_id) {
    const url = `imp/feature/${feature_id}/removeIssueFromFeatureTestable/`
    const field_name = "issue_id"
    const field_value = issue_id
    const method = "PUT"
    const data = { feature_id: feature_id,
                   testable_id: testable_id,
                   issue_id: issue_id}
    return itemPost(ENTITY_KEY__FEATURE, [feature_id], url, field_name, field_value, method, data)
}

export function autoCreateIssuesFromFeatures(project_id) {
    const url = `imp/feature/auto_create_issues_from_features/`
    const field_name = "project_id"
    const field_value = project_id
    const method = "POST"
    const data = { project_id: project_id }
    return itemPost(ENTITY_KEY__FEATURE, [project_id], url, field_name, field_value, method, data)
}
