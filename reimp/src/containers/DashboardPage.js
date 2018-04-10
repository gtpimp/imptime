import React, {Component} from 'react'
import {connect} from 'react-redux'
import { setBreadcrumbsActive } from '../actions/Breadcrumbs'
import ProjectDashboardList from '../components/ProjectDashboardList'
import {withRouter} from 'react-router-dom'

import { PAGE_KEY__DASHBOARD_PAGE,
         LIST_KEY__PROJECT_DASHBOARD_LIST
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars
} from '../actions/Page'

class DashboardPage extends Component {

    componentDidMount() {
        const { dispatch } = this.props
        dispatch(setBreadcrumbsActive(false))
        dispatch(set_toolbars(PAGE_KEY__DASHBOARD_PAGE, ['project-dashboards']))
    }

    componentWillReceiveProps() {
        const { dispatch } = this.props
        dispatch(setBreadcrumbsActive(false))
    }
    
    render() {

        return (
            <div>
              <ProjectDashboardList list_key={LIST_KEY__PROJECT_DASHBOARD_LIST} />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {}
}

export default withRouter(connect(mapStateToProps)(DashboardPage))
