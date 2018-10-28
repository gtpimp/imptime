import { ENTITY_KEY__INVOICE } from '../actions/ItemListKeyRegistry'

import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
} from '../actions/Item'

export var ALL_AVAILABLE_INVOICE_HEADERS = [{key:'invoice_number', label:"Number", width:"auto", flex:1, is_default: true},
                                            {key:'client_name', label:'Client', width:'auto', flex:1, is_default: true},
                                            {key:'internal_comment', label:'Comment', width:'auto', flex:1},
                                            {key:'project_id', label:'Project', width:'auto', flex:1, is_default: true},
                                            {key:'sprint_id', label:'Sprint', width:'auto', flex:1, is_default: true},
                                            {key:'created', label:'Created at', width:'auto', flex:1},
                                            {key:'issued_at', label:'Issued at', width:'auto', flex:1},
                                            {key:'payment_due', label:'Due at', width:'auto', flex:1, is_default: true},
                                            {key:'paid_at', label:'Paid at', width:'auto', flex:1},
                                            {key:'status', label:'Status', width:'auto', flex:1, is_default: true},
                                            {key:'is_overdue', label:'Overdue', width:'auto', flex:1},
                                            {key:'cost_ex_vat', label:'Cost exVAT', width:'auto', flex:1, is_default: true},
                                            {key:'vat', label:'Vat', width:'auto', flex:1, is_default: true},
                                            {key:'cost_with_vat', label:'Cost with VAT', width:'auto', flex:1, is_default: true},
                                            {key:'amount_paid', label:'Paid', width:'auto', flex:1, is_default: true},
                                            {key:'amount_written_off', label:'Written off', width:'auto', flex:1},
                                            {key:'amount_owed', label:'Owed', width:'auto', flex:1},
                                            {key:'invoice_note', label:'Note', width:'auto', flex:1},
]

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

