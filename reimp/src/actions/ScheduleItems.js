import { ENTITY_KEY__SCHEDULE_ITEM } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    updateItem,
    deleteItems
} from '../actions/Item'

export function invalidateAllScheduleItems() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__SCHEDULE_ITEM))
    }
}

export function invalidateScheduleItems(schedule_item_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__SCHEDULE_ITEM,
                                 schedule_item_ids_to_invalidate
        ))
    }
}

export function updateScheduleItem(schedule_item_ids, field_name, new_value, on_done) {
    return updateItem(ENTITY_KEY__SCHEDULE_ITEM, schedule_item_ids, field_name, new_value, on_done)
}

export function fetchScheduleItemsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__SCHEDULE_ITEM, list_key))
    }
}

export function ensureScheduleItemsLoaded(schedule_item_ids) {
    return ensureItemsLoaded(ENTITY_KEY__SCHEDULE_ITEM, schedule_item_ids)
}

export function getScheduleItem(state, schedule_item_id) {
    return getItem(state, ENTITY_KEY__SCHEDULE_ITEM, schedule_item_id)
}

export function getScheduleItems(state, schedule_item_ids) {
    return getItems(state, ENTITY_KEY__SCHEDULE_ITEM, schedule_item_ids)
}

export function deleteScheduleItem(schedule_item_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__SCHEDULE_ITEM, [schedule_item_id]))
    }
}

