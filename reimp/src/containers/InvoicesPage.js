import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import InvoiceList from '../components/InvoiceList'
import {
    LIST_KEY__INVOICE_LIST,
    PAGE_KEY__INVOICES_PAGE,
    INVOICE_HEADER_LIST
} from '../actions/ItemListKeyRegistry'
import {
    update_list_filter,
    update_list_pagination,
} from '../actions/ItemList'
import {
    set_toolbars,
} from '../actions/Page'

class InvoicesPage extends Component {

    componentDidMount() {
        const {dispatch, list_key} = this.props
        dispatch(set_toolbars(PAGE_KEY__INVOICES_PAGE, []))
        dispatch(update_list_filter(list_key, {}))
        dispatch(update_list_pagination(list_key, {page_size: 20}))
    }

    render() {
        const { invoice_header_list, list_key} = this.props
        return (
            <div className="list-layout__list">
              <InvoiceList list_key={list_key}
                           header_list={invoice_header_list} />
            </div>
        )
    }
}

function mapStateToProps(state, props) {

    const invoice_header_list = INVOICE_HEADER_LIST
    
    return {
        invoice_header_list,
        list_key: LIST_KEY__INVOICE_LIST,
    }
}

export default withRouter(connect(mapStateToProps)(InvoicesPage))
