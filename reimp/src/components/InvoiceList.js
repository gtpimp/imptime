import React, { Component } from 'react'
import { size, includes } from 'lodash'
import { connect } from 'react-redux'
import { css } from 'emotion'
import { default_theme as theme } from '../theme/default'
import {
    invalidateList,
    getVisibleItemIds,
    getVisibleItems,
    isLoading,
    getLastUpdated,
    getLoadingItemIds,
    getSelectedItemIds,
    getListFilter
} from '../actions/ItemList'
import {
    invalidateAllInvoices,
    fetchInvoicesIfNeeded,
    ALL_AVAILABLE_INVOICE_HEADERS,
} from '../actions/Invoices'
import CommonTable from './CommonTable'
import StatusCircle from './StatusCircle'
import CurrencyValue from './CurrencyValue'
import Timestamp from './Timestamp'
import ProjectName from './ProjectName'
import SprintName from './SprintName'
import {
    ENTITY_KEY__INVOICE,
    HEADER_LIST_NAME__INVOICE
} from '../actions/ItemListKeyRegistry'
import DivTableCell from './DivTableCell'

class InvoiceList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onChangePage = this.onChangePage.bind(this)
    }

    componentWillReceiveProps() {
        const { dispatch, list_key, filter } = this.props
        if ( size(filter)>0 ) {
            dispatch(fetchInvoicesIfNeeded(list_key))
        }
    }

    onChangePage() {
        const { dispatch, list_key } = this.props
	dispatch(invalidateList(list_key))
    }

    onRefresh(event) {
        const { dispatch, list_key, filter } = this.props
	dispatch(invalidateList(list_key))
	dispatch(invalidateAllInvoices())
        if ( size(filter)>0 ) {
	    dispatch(fetchInvoicesIfNeeded(list_key))
        }
	if ( event ) {
	    event.stopPropagation()
	}
    }

    onClickedInvoice(invoice_id) {
    }

    onSelectedInvoices = (invoice_ids) => {
        const {onSelectInvoices} = this.props
        if ( onSelectInvoices ) {
            onSelectInvoices(invoice_ids)
        }
    }

    renderCell = ({cellData, columnData, columnIndex, dataKey, isScrolling, rowData, rowIndex, activeHeaders}) => {
        const { invoices } = this.props
        const key = `invoice_${columnIndex}_${rowIndex}`
        const header = activeHeaders[columnIndex]
        const header_key = header.key
        const item = invoices[rowIndex]
        if ( item.loaded === false ) {
            return (
                <DivTableCell key={key}>
                </DivTableCell>
            )
        }
        if ( item.type === "candidate" ) {
            return  (
                <DivTableCell key={key}
                              extra_style={css`background-color:${theme.colours.new_item_background}`}>
                  { header_key === "name" && "Creating invoice..." }
                  { header_key !== "name" && <span>&nbsp;</span> }
                </DivTableCell>
            )
        }
        
        const invoice = item
        let content = null

        if ( isScrolling ) {
            const NON_SCROLLING_FIELDS = []
            if ( includes(NON_SCROLLING_FIELDS, header_key) ) {
                return (
                    <DivTableCell key={key}>
                      null
                    </DivTableCell>
                )
            }
        }
        
        switch(header_key) {

                
            case "invoice_number":
                content = (
                    <DivTableCell key={header.key} >
                      <div>{invoice.invoice_number}</div>
                    </DivTableCell>
                )
                break
            case "client_name":
                content = (
                    <DivTableCell key={header.key} >
                      <div>{invoice.client_name}</div>
                    </DivTableCell>
                )
                break
            case "internal_comment":
                content = (
                    <DivTableCell key={header.key} >
                      <div>{invoice.internal_comment}</div>
                    </DivTableCell>
                )
                break
            case "project_id":
                content = (
                    <DivTableCell key={header.key} >
                      <ProjectName project_id={invoice.project_id} />
                    </DivTableCell>
                )
                break

            case "sprint_id":
                content = (
                    <DivTableCell key={header.key} >
                      <SprintName sprint_id={invoice.sprint_id} />
                    </DivTableCell>
                )
                break

            case "created":
                content = (
                    <DivTableCell key={header.key} >
                      <Timestamp value={invoice.created} format="from_now"/>
                    </DivTableCell>
                )
                break

            case "issued_at":
                content = (
                    <DivTableCell key={header.key} >
                      <Timestamp value={invoice.issued_at} format="from_now"/>
                    </DivTableCell>
                )
                break

            case "payment_due":
                content = (
                    <DivTableCell key={header.key} >
                      <Timestamp value={invoice.payment_due} format="from_now"/>
                    </DivTableCell>
                )
                break

            case "paid_at":
                content = (
                    <DivTableCell key={header.key} >
                      <Timestamp value={invoice.paid_at} format="from_now"/>
                    </DivTableCell>
                )
                break

            case "status":
                content = (
                    <DivTableCell key={header.key} >
                      <div>{invoice.status}</div>
                    </DivTableCell>
                )
                break

            case "is_overdue":
                content = (
                    <DivTableCell key={header.key} >
                      <div><StatusCircle colour={(invoice.is_overdue && "red") || "green"}/></div>
                    </DivTableCell>
                )
                break

            case "cost_ex_vat":
                content = (
                    <DivTableCell key={header.key} >
                      <CurrencyValue value={invoice.cost_ex_vat} />
                    </DivTableCell>
                )
                break

            case "vat":
                content = (
                    <DivTableCell key={header.key} >
                      <CurrencyValue value={invoice.vat} />
                    </DivTableCell>
                )
                break

            case "cost_with_vat":
                content = (
                    <DivTableCell key={header.key} >
                      <CurrencyValue value={invoice.cost_with_vat} />
                    </DivTableCell>
                )
                break

            case "amount_paid":
                content = (
                    <DivTableCell key={header.key} >
                      <CurrencyValue value={invoice.amount_paid} />
                    </DivTableCell>
                )
                break

            case "amount_written_off":
                content = (
                    <DivTableCell key={header.key} >
                      <CurrencyValue value={invoice.amount_written_off} />
                    </DivTableCell>
                )
                break

            case "amount_owed":
                content = (
                    <DivTableCell key={header.key} >
                      <CurrencyValue value={invoice.cost_owed} />
                    </DivTableCell>
                )
                break
            case "invoice_note":
                content = (
                    <DivTableCell key={header.key} >
                      <div>{invoice.invoice_note}</div>
                    </DivTableCell>
                )
                break

            default:
                console.error("Unknown header: " + header_key)
        }
        
        return (
            <div key={key}>
              {content}
            </div>
        )
    }

    render() {
        const { invoices, selected_item_ids, all_headers } = this.props
	return (
            <CommonTable all_headers={all_headers}
                         header_list_name={HEADER_LIST_NAME__INVOICE}
                         onRowSelected={this.onClickedInvoice}
                         onRowSelectionUpdated={this.onSelectedInvoices}
                         items={invoices}
                         selected_item_ids={selected_item_ids}
                         renderCell={this.renderCell}
            />
	)
    }
}

function mapStateToProps(state, props) {
    const { list_key } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__INVOICE)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    const selected_item_ids = getSelectedItemIds(state, list_key)
    const is_loading = isLoading(state, list_key)
    const last_updated = getLastUpdated(state, list_key)
    const filter = getListFilter(state, list_key)

    return {
        list_key: list_key,
        visible_item_ids,
        invoices: visible_items,
        invoice_ids: visible_item_ids,
        selected_item_ids,
        loading_item_ids,
        has_items: visible_items && visible_items.length > 0,
        is_loading,
        last_updated,
        all_headers: ALL_AVAILABLE_INVOICE_HEADERS,
        filter
    }
}

export default connect(mapStateToProps)(InvoiceList)
