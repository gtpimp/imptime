import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import InvoiceList from '../components/InvoiceList'
import {
    LIST_KEY__INVOICE_LIST,
    PAGE_KEY__INVOICES_PAGE
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
        const {dispatch, list_key, company_id} = this.props
        dispatch(set_toolbars(PAGE_KEY__INVOICES_PAGE, []))
        dispatch(update_list_filter(list_key, {from_company_id: company_id}))
        dispatch(update_list_pagination(list_key, {page_size: 20}))
    }

    render() {
        const { list_key} = this.props
        return (
            <InvoiceList list_key={list_key} />
        )
    }
}

function mapStateToProps(state, props) {

    const company_id = props.match.params.companyId
    
    return {
        list_key: LIST_KEY__INVOICE_LIST,
        company_id
    }
}

export default withRouter(connect(mapStateToProps)(InvoicesPage))
