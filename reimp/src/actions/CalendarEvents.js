import {
    ENTITY_KEY__CALENDAR_EVENT,
} from './ItemListKeyRegistry'
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
    deleteItems
} from '../actions/Item'

export function invalidateAllCalendarEvents() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__CALENDAR_EVENT))
    }
}

export function invalidateCalendarEvents(calendar_event_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__CALENDAR_EVENT,
                                 calendar_event_ids_to_invalidate
        ))
    }
}

export function updateCalendarEvent(calendar_event_ids, field_name, new_value, on_done) {
    return updateItem(ENTITY_KEY__CALENDAR_EVENT, calendar_event_ids, field_name, new_value, on_done)
}

export function fetchCalendarEventsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__CALENDAR_EVENT, list_key))
    }
}

export function ensureCalendarEventsLoaded(calendar_event_ids) {
    return ensureItemsLoaded(ENTITY_KEY__CALENDAR_EVENT, calendar_event_ids)
}

export function getCalendarEvent(state, calendar_event_id) {
    return getItem(state, ENTITY_KEY__CALENDAR_EVENT, calendar_event_id)
}

export function getCalendarEvents(state, calendar_event_ids) {
    return getItems(state, ENTITY_KEY__CALENDAR_EVENT, calendar_event_ids)
}

export function createCalendarEvent(header, content) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__CALENDAR_EVENT, { header: header,
                                                         content: content }))
        dispatch(saveCandidateItem(ENTITY_KEY__CALENDAR_EVENT))
    }
}

export function deleteCalendarEvent(calendar_event_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__CALENDAR_EVENT, [calendar_event_id]))
    }
}
