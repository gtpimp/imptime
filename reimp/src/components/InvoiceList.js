import React, { Component } from 'react'
import { map, size } from 'lodash'
import { connect } from 'react-redux'
import {
    invalidateList,
    getVisibleItemIds,
    getVisibleItems,
    isLoading,
    getLastUpdated,
    getLoadingItemIds,
    getListFilter
} from '../actions/ItemList'
import {
    invalidateAllInvoices,
    fetchInvoicesIfNeeded
} from '../actions/Invoices'
import Pagination from './Pagination'
import Invoice from './Invoice'
import DivTable from './DivTable'
import { ENTITY_KEY__INVOICE } from '../actions/ItemListKeyRegistry'
import { getCellStyle } from '../actions/ItemListKeyRegistry'

class InvoiceList extends Component {

    constructor(props) {
        super(props)
        this.onRefresh = this.onRefresh.bind(this)
        this.onChangePage = this.onChangePage.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
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

    renderHeader() {
        const { header_list } = this.props
        return (
            <div className="div-table__header_row">
              { map(header_list, (v, k) => (
                    <div key={k}
                         className="div-table__header_cell"
                         style={getCellStyle(v)}>
                      {v.label }
                    </div>
                ))}
            </div>
        )
    }
    
    renderExpandedInvoice(invoice, index) {
        const { list_key, loading_item_ids, header_list } = this.props

        const is_loading = loading_item_ids.indexOf(invoice.id) !== -1 || invoice.loaded === false
        
        return (
            <Invoice key={list_key + "_" + invoice.id + "_" + invoice.name + "_" + index}
                     is_collapsed={false}
                     is_loading={is_loading}
                     header_list={header_list}
                     invoice_id={invoice.id}
            />
        )
    }

    render() {
        const { list_key, invoices } = this.props
	return (
	    <div>
              <DivTable renderHeader={this.renderHeader}>
                {invoices.map((invoice, index) => this.renderExpandedInvoice(invoice, index))}
              </DivTable>
              <Pagination list_key={list_key}
                          on_changed={this.onChangePage} />
	    </div>
	)
    }
}

function mapStateToProps(state, props) {
    const { list_key, header_list } = props
    const visible_item_ids = getVisibleItemIds(state, list_key)
    const visible_items = getVisibleItems(state, list_key, ENTITY_KEY__INVOICE)
    const loading_item_ids = getLoadingItemIds(state, list_key)
    const is_loading = isLoading(state, list_key)
    const last_updated = getLastUpdated(state, list_key)
    const filter = getListFilter(state, list_key)

    return {
        list_key: list_key,
        visible_item_ids,
        invoices: visible_items,
        invoice_ids: visible_item_ids,
        loading_item_ids,
        has_items: visible_items && visible_items.length > 0,
        is_loading,
        last_updated,
        header_list,
        filter
    }
}

export default connect(mapStateToProps)(InvoiceList)
