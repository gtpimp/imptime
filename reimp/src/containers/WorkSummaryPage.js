import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { setBreadcrumbsActive } from '../actions/Breadcrumbs'
import WorkSummaryList from '../components/WorkSummaryList'

import { PAGE_KEY__WORK_SUMMARY_PAGE,
         LIST_KEY__WORK_SUMMARY_LIST,
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars
} from '../actions/Page'

class WorkSummaryPage extends Component {

    componentDidMount() {
        const { dispatch } = this.props
        dispatch(setBreadcrumbsActive(false))
        dispatch(set_toolbars(PAGE_KEY__WORK_SUMMARY_PAGE, ['work-summary']))
    }

    componentWillReceiveProps() {
        const { dispatch } = this.props
        dispatch(setBreadcrumbsActive(false))
    }
    
    render() {

        return (
            <div>
              <WorkSummaryList list_key={LIST_KEY__WORK_SUMMARY_LIST} />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {}
}

export default connect(mapStateToProps)(withRouter(WorkSummaryPage))
