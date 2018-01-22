import React, {Component} from 'react'
import {connect} from 'react-redux'
import { setBreadcrumbsActive } from '../actions/Breadcrumbs'
import SummaryList from '../components/SummaryList'

import { PAGE_KEY__SUMMARY_PAGE,
         LIST_KEY__SUMMARY_LIST,
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars
} from '../actions/Page'

class SummaryPage extends Component {

    componentDidMount() {
        const { dispatch } = this.props
        dispatch(setBreadcrumbsActive(false))
        dispatch(set_toolbars(PAGE_KEY__SUMMARY_PAGE, ['summary']))
    }

    componentWillReceiveProps() {
        const { dispatch } = this.props
        dispatch(setBreadcrumbsActive(false))
    }
    
    render() {

        return (
            <div>
              <SummaryList list_key={LIST_KEY__SUMMARY_LIST} />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {}
}

export default connect(mapStateToProps)(SummaryPage)
