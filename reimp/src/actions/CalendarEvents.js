import {
    ENTITY_KEY__CALENDAR_EVENT,
} from './ItemListKeyRegistry'
import moment from 'moment';
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
    deleteItems,
} from './Item'
import {
    setListFlag,
    getListFlag
} from './ItemList'
import { getGlobalPageFlag, setGlobalPageFlag } from './Page'

export function setCurrentDate(list_key, date) {
    return setListFlag(list_key, 'current_date', date)
}

export function getCurrentDate(state, list_key, default_value) {
    return getListFlag(state, list_key, 'current_date', default_value || moment())
}

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

export function createCalendarEvent(schedule_id, start_at, end_at, entity_ids) {
    return (dispatch, getState) => {
        const data = Object.assign({},
                                   {schedule_id:schedule_id,
                                    start_at:start_at,
                                    end_at:end_at},
                                   entity_ids)
        
        dispatch(startCandidateItem(ENTITY_KEY__CALENDAR_EVENT, data))
        dispatch(saveCandidateItem(ENTITY_KEY__CALENDAR_EVENT))
    }
}

export function updateCalendarEventDates(event_id, start_at, end_at) {
    const field_name="dates"
    const new_value={start_at:start_at,
                     end_at:end_at}
    return updateItem(ENTITY_KEY__CALENDAR_EVENT, [event_id], field_name, new_value)
}

export function deleteCalendarEvent(calendar_event_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__CALENDAR_EVENT, [calendar_event_id]))
    }
}

export function showFloatingCalendar() {
    return setGlobalPageFlag("display_floating_calendar", true)
}

export function hideFloatingCalendar() {
    return setGlobalPageFlag("display_floating_calendar", false)
}

export function isFloatingCalendarVisible(state) {
    return getGlobalPageFlag(state, "display_floating_calendar", false)
}
