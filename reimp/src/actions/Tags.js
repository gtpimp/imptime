import { groupBy } from 'lodash'
import { ENTITY_KEY__TAG } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getAllItems,
    getItems,
    updateItem,
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

export function updateTags(tag_ids, new_category_name, new_name, on_done) {
    const new_value = {'category_name': new_category_name,
                 'name': new_name}
    return updateItem(ENTITY_KEY__TAG, tag_ids, "tag", new_value, on_done)
}

export function fetchTagsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__TAG, list_key))
    }
}

export function getTagCategoryName(state, tag_category_id) {
    // assumes at least one tag with this category has already been loaded
    const tags = getAllItems(state, ENTITY_KEY__TAG)
    const tags_by_category_id = groupBy(tags, 'category_id')
    return ((tags_by_category_id[tag_category_id] || [])[0] || {}).category_name || "unknown"
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
