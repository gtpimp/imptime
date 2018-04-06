import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'
import { setBreadcrumbsActive } from '../actions/Breadcrumbs'
import UserTimesheetList from '../components/UserTimesheetList'

import { PAGE_KEY__USER_TIMESHEET_PAGE,
         LIST_KEY__USER_TIMESHEET_LIST
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars
} from '../actions/Page'

class UserTimesheetPage extends Component {

    componentDidMount() {
        const { dispatch } = this.props
        dispatch(setBreadcrumbsActive(false))
        dispatch(set_toolbars(PAGE_KEY__USER_TIMESHEET_PAGE, ['user-timesheets']))
    }

    componentWillReceiveProps() {
        const { dispatch } = this.props
        dispatch(setBreadcrumbsActive(false))
    }
    
    render() {

        return (
            <div>
              <UserTimesheetList list_key={LIST_KEY__USER_TIMESHEET_LIST} />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {}
}

export default withRouter(connect(mapStateToProps)(UserTimesheetPage))
