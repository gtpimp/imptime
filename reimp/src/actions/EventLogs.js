import { hash_flat_object } from './lib.js'
import { ENTITY_KEY__EVENT_LOG } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    ensureItemsLoaded,
    isLoadingItems,
    getItem,
    is_item_invalidated,
    getLoadingItemIds
} from '../actions/Item'

export function getEventLogKey(filter) {
    return "" + hash_flat_object(filter)
}

export function invalidateAllEventLogs() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__EVENT_LOG))
    }
}

export function invalidateEventLog(filter) {
    return (dispatch, getState) => {
        const event_log_key = getEventLogKey(filter)
        dispatch(invalidateItems(ENTITY_KEY__EVENT_LOG, [event_log_key]))
    }
}

export function ensureEventLogLoaded(filter) {
    const event_log_key = getEventLogKey(filter)
    const additional_get_args = {filter: filter}
    return ensureItemsLoaded(ENTITY_KEY__EVENT_LOG, [event_log_key], additional_get_args)
}

export function isLoadingEventLog(state, filter) {
    const event_log_key = getEventLogKey(filter)
    return isLoadingItems(state, ENTITY_KEY__EVENT_LOG, [event_log_key])
}

export function getEventLog(state, filter) {
    const event_log_key = getEventLogKey(filter)
    return getItem(state, ENTITY_KEY__EVENT_LOG, event_log_key)
}

export function isEventLogInvalidated(state, filter) {
    const event_log_key = getEventLogKey(filter)
    return is_item_invalidated(ENTITY_KEY__EVENT_LOG, state, event_log_key)
}

export function isEventLogLoading(state, filter) {
    const event_log_key = getEventLogKey(filter)
    return getLoadingItemIds(state, ENTITY_KEY__EVENT_LOG, [event_log_key])
}
