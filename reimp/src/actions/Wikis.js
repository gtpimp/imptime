import { ENTITY_KEY__WIKI } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    updateItem,
    cancelCandidateItem,
    getCandidateItem,
    startCandidateItem,
    updateCandidateDetails,
    saveCandidateItem,
    deleteItems,
} from '../actions/Item'

export function invalidateAllWikis() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__WIKI))
    }
}

export function invalidateWikis(wiki_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__WIKI,
                                 wiki_ids_to_invalidate
        ))
    }
}

export function updateWikis(wiki_ids, field_name, new_value, on_done) {
    return updateItem(ENTITY_KEY__WIKI, wiki_ids, field_name, new_value, on_done)
}

export function updateWikiContent(wiki_id, new_content, on_done) {
    return updateItem(ENTITY_KEY__WIKI, [wiki_id], "content", new_content, on_done)
}

export function updateWikiName(wiki_id, new_name, on_done) {
    return updateItem(ENTITY_KEY__WIKI, [wiki_id], "name", new_name, on_done)
}

export function updateWikiMoneySensitive(wiki_id, new_bool, on_done) {
    return updateItem(ENTITY_KEY__WIKI, [wiki_id], "money_sensitive", new_bool, on_done)
}

export function updateWikiStoreEncrypted(wiki_id, new_bool, on_done) {
    return updateItem(ENTITY_KEY__WIKI, [wiki_id], "store_encrypted", new_bool, on_done)
}

export function fetchWikisIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__WIKI, list_key))
    }
}

export function ensureWikisLoaded(wiki_ids) {
    return ensureItemsLoaded(ENTITY_KEY__WIKI, wiki_ids)
}

export function getWiki(state, wiki_id) {
    return getItem(state, ENTITY_KEY__WIKI, wiki_id)
}

export function getWikis(state, wiki_ids) {
    return getItems(state, ENTITY_KEY__WIKI, wiki_ids)
}

export function startCandidateWiki(project_id) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__WIKI, { project_id: project_id }))
    }
}

export function updateCandidateName(name) {
    return updateCandidateDetails(ENTITY_KEY__WIKI, {name:name})
}

export function cancelCandidateWiki() {
    return cancelCandidateItem(ENTITY_KEY__WIKI)
}

export function getCandidateWiki(state) {
    return getCandidateItem(ENTITY_KEY__WIKI, state)
}

export function saveCandidateWiki(on_done) {
    return saveCandidateItem(ENTITY_KEY__WIKI, on_done)
}

export function createWiki(name, project_id) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__WIKI, { name: name, project_id: project_id }))
        dispatch(saveCandidateItem(ENTITY_KEY__WIKI))
    }
}

export function deleteWiki(wiki_id) {
    return (dispatch, getState) => {
        dispatch(deleteItems(ENTITY_KEY__WIKI, [wiki_id]))
    }
}
