import React, {Component} from 'react'
import {connect} from 'react-redux'
import { setBreadcrumbsActive } from '../actions/Breadcrumbs'
import ProjectDashboardList from '../components/ProjectDashboardList'
import { LIST_KEY__PROJECT_DASHBOARD_LIST } from '../actions/ItemListKeyRegistry'

class DashboardPage extends Component {

    componentDidMount() {
        const { dispatch } = this.props
        dispatch(setBreadcrumbsActive(false))
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

export default connect(mapStateToProps)(DashboardPage)
