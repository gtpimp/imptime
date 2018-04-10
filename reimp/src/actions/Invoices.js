import { ENTITY_KEY__INVOICE } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
} from '../actions/Item'

export function invalidateAllInvoices() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__INVOICE))
    }
}

export function invalidateInvoices(invoice_ids_to_invalidate) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__INVOICE,
                                 invoice_ids_to_invalidate
        ))
    }
}

export function fetchInvoicesIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__INVOICE, list_key))
    }
}

export function ensureInvoicesLoaded(invoice_ids) {
    return ensureItemsLoaded(ENTITY_KEY__INVOICE, invoice_ids)
}

export function getInvoice(state, invoice_id) {
    return getItem(state, ENTITY_KEY__INVOICE, invoice_id)
}

export function getInvoices(state, invoice_ids) {
    return getItems(state, ENTITY_KEY__INVOICE, invoice_ids)
}

