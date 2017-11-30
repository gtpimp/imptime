import { impfetch } from './lib.js'
import { compact, map, keys, keyBy, includes, difference, indexOf, identity } from 'lodash'
import move from 'lodash-move'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { setIssueStoreValue } from './Issues'
import { ENTITY_KEY__TAG } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsPromise,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    updateItem,
    startCandidateItem,
    saveCandidateItem,
    deleteItem,
    announceItemSaveFailed,
    announceItemsSaved,
    announceItemsSaving
} from '../actions/Item'

export function invalidateAllTags() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__TAG))
    }
}

export function invalidateTags(tag_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__TAG,
                                 tag_ids_to_invalidate
        ))
    }
}

export function updateTags(tag_ids, field_name, new_value, on_done) {
    return updateItem(ENTITY_KEY__TAG, tag_ids, field_name, new_value, on_done)
}

export function fetchTagsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__TAG, list_key))
    }
}

export function ensureTagsLoaded(tag_ids) {
    return ensureItemsLoaded(ENTITY_KEY__TAG, tag_ids)
}

export function getTag(state, tag_id) {
    return getItem(state, ENTITY_KEY__TAG, tag_id)
}

export function getTags(state, tag_ids) {
    return getItems(state, ENTITY_KEY__TAG, tag_ids)
}

export function createTag(name, category_name, issue_ids) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__TAG, { name: name,
                                                       category_name: category_name,
                                                       issue_ids: issue_ids }))
        dispatch(saveCandidateItem(ENTITY_KEY__TAG))
    }
}

