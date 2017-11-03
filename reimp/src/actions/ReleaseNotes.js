import { impfetch } from './lib.js'
import { compact, map, keys, keyBy, includes, difference, indexOf, identity } from 'lodash'
import move from 'lodash-move'
import { fetchListIfNeeded, getMissingItemIds } from './ItemList'
import { setIssueStoreValue } from './Issues'
import { ENTITY_KEY__RELEASE_NOTE } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsPromise,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    updateItem
} from '../actions/Item'

export function invalidateAllReleaseNotes() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__RELEASE_NOTE))
    }
}

export function invalidateReleaseNotes(release_note_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__RELEASE_NOTE,
                                 release_note_ids_to_invalidate
        ))
    }
}

export function updateReleaseNote(release_note_ids, field_name, new_value, on_done) {
    return updateItem(ENTITY_KEY__RELEASE_NOTE, release_note_ids, field_name, new_value, on_done)
}

export function fetchReleaseNotesIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__RELEASE_NOTE, list_key))
    }
}

export function ensureReleaseNotesLoaded(release_note_ids) {
    return ensureItemsLoaded(ENTITY_KEY__RELEASE_NOTE, release_note_ids)
}

export function getReleaseNote(state, release_note_id) {
    return getItem(state, ENTITY_KEY__RELEASE_NOTE, release_note_id)
}

export function getReleaseNotes(state, release_note_ids) {
    return getItems(state, ENTITY_KEY__RELEASE_NOTE, release_note_ids)
}

