import { impfetch } from './lib.js'
import { ENTITY_KEY__SCHEDULE } from '../actions/ItemListKeyRegistry'

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
    announceItemSaveFailed,
    announceItemsSaved,
    announceItemsSaving,
    itemPost
} from '../actions/Item'

export function invalidateAllSchedules() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__SCHEDULE))
    }
}

export function invalidateSchedules(schedule_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__SCHEDULE,
                                 schedule_ids_to_invalidate
        ))
    }
}

export function updateSchedule(schedule_ids, field_name, new_value, on_done) {
    return updateItem(ENTITY_KEY__SCHEDULE, schedule_ids, field_name, new_value, on_done)
}

export function fetchSchedulesIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__SCHEDULE, list_key))
    }
}

export function ensureSchedulesLoaded(schedule_ids) {
    return ensureItemsLoaded(ENTITY_KEY__SCHEDULE, schedule_ids)
}

export function getSchedule(state, schedule_id) {
    return getItem(state, ENTITY_KEY__SCHEDULE, schedule_id)
}

export function getSchedules(state, schedule_ids) {
    return getItems(state, ENTITY_KEY__SCHEDULE, schedule_ids)
}

export function createSchedule(header, content) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__SCHEDULE, { header: header,
                                                         content: content }))
        dispatch(saveCandidateItem(ENTITY_KEY__SCHEDULE))
    }
}

export function deleteSchedule(schedule_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__SCHEDULE, [schedule_id]))
    }
}

export function addViewableUsersToSchedule(schedule_id, user_emails) {
    const url = "imp/" + ENTITY_KEY__SCHEDULE + "/" + schedule_id + "/add_viewable_user/"
    const field_name = "user_emails"
    const field_value = user_emails
    const method = "POST"
    const data = { user_emails: user_emails }
    return itemPost(ENTITY_KEY__SCHEDULE, user_emails, url, field_name, field_value, method, data)
}

export function removeViewableUsersToSchedule(schedule_id, user_ids) {
    const url = "imp/" + ENTITY_KEY__SCHEDULE + "/" + schedule_id + "/remove_viewable_user/"
    const field_name = "user_ids"
    const field_value = user_ids
    const method = "POST"
    const data = { user_ids: user_ids }
    return itemPost(ENTITY_KEY__SCHEDULE, user_ids, url, field_name, field_value, method, data)
}

export function addEditableUsersToSchedule(schedule_id, user_emails) {
    const url = "imp/" + ENTITY_KEY__SCHEDULE + "/" + schedule_id + "/add_editable_user/"
    const field_name = "user_emails"
    const field_value = user_emails
    const method = "POST"
    const data = { user_emails: user_emails }
    return itemPost(ENTITY_KEY__SCHEDULE, user_emails, url, field_name, field_value, method, data)
}

export function removeEditableUsersToSchedule(schedule_id, user_ids) {
    const url = "imp/" + ENTITY_KEY__SCHEDULE + "/" + schedule_id + "/remove_editable_user/"
    const field_name = "user_ids"
    const field_value = user_ids
    const method = "POST"
    const data = { user_ids: user_ids }
    return itemPost(ENTITY_KEY__SCHEDULE, user_ids, url, field_name, field_value, method, data)
}

export function recalculateSchedules() {
    return (dispatch, getState) => {
	const state = getState()
	dispatch(announceItemsSaving(ENTITY_KEY__SCHEDULE, []))
	let data = {}
	return impfetch( state, "imp/" + ENTITY_KEY__SCHEDULE + "/recalculate/", dispatch,
			 {method: "POST",
			  credentials: 'same-origin',
			  data: data,
			  headers: {"Content-type": "application/json; charset=UTF-8"},
			  body: JSON.stringify(data)}
	).then(response => response.json())
	 .then(json => {
             if ( json.status !== 'success' ) {
		 console.log('Request failed with JSON response', json);
                 dispatch(announceItemSaveFailed(ENTITY_KEY__SCHEDULE, json.error))
             } else {
		 console.log('Request succeeded with JSON response', json);
		 dispatch(announceItemsSaved(ENTITY_KEY__SCHEDULE, []))
             }
	 })
	 .catch(function (error) {
             console.log('Request failed', error);
             dispatch(announceItemSaveFailed(ENTITY_KEY__SCHEDULE, error))
	 })
    }
}
