import { ENTITY_KEY__WIKI } from '../actions/ItemListKeyRegistry'
import aes from 'crypto-js/aes'
import enc from 'crypto-js/enc-utf8'
import { updateVisibleItemIdAbove } from './ItemList'
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
    getTransientItemValue,
    setTransientItemValue
} from '../actions/Item'

const ENCRYPTED_TOKEN = "__ENCRYPTED__"

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

export function updateWikiPosition(wiki_id, parent_wiki_id, sibling_node_before_id) {
    return updateItem(ENTITY_KEY__WIKI, [wiki_id], "position",
                      {parent_id:parent_wiki_id, sibling_node_before_id})
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

export function startCandidateWiki(project_id, parent_wiki_id) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__WIKI, { parent_wiki_id: parent_wiki_id,
                                                        project_id: project_id }))
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

export function expandWikiInTree(wiki_id, expanded) {
    return setTransientItemValue(ENTITY_KEY__WIKI, [wiki_id], "expanded", expanded)
}

export function isWikiExpanded(state, wiki_id) {
    return getTransientItemValue(state, ENTITY_KEY__WIKI, wiki_id, "expanded") || false
}

export function reorderWiki(moving_wiki_ids, wiki_id_after, list_key, index_of_destination, on_done) {
    return (dispatch, getState) => {
        dispatch(updateVisibleItemIdAbove(list_key, moving_wiki_ids, wiki_id_after, index_of_destination))
        dispatch(updateItem(ENTITY_KEY__WIKI, moving_wiki_ids, "wiki_id_after", wiki_id_after, on_done))
    }
}

export function encryptContent(unencrypted_content, password) {

    const encrypted = ENCRYPTED_TOKEN + aes.encrypt(unencrypted_content, password).toString()
    const decrypted = decryptContent(encrypted, password)
    if ( unencrypted_content !== decrypted ) {
        return null
    }
    return encrypted
}

export function decryptContent(encrypted_content, password) {
    encrypted_content = encrypted_content.slice(ENCRYPTED_TOKEN.length)
    const bytes = aes.decrypt(encrypted_content, password)
    const unencrypted = bytes.toString(enc)
    return unencrypted
}


