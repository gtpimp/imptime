import React, { Component } from 'react'
import { DragSource, DropTarget } from 'react-dnd';
import { connect } from 'react-redux'
import classNames from 'classnames'
import { DndTypes } from '../actions/Dnd'
import '../sass/project.css'
import {
    getProjectDashboard,
    ensureProjectDashboardsLoaded
} from '../actions/ProjectDashboards'

class ProjectDashboard extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const { dispatch, project_id } = these_props || this.props
        if ( project_id ) {
            dispatch(ensureProjectDashboardsLoaded([project_id]))
        }
    }
    
    render() {
        const { project_dashboard_id, project_dashboard } = this.props

        return (
            <div className="project_dashboard">
              { ! project_dashboard_id &&
                <div>Loading...</div>
              }
              { project_dashboard_id &&
                <div>{project_dashboard_id}</div>
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const { project_id } = props
    const project_dashboard = getProjectDashboard(state, project_id)
    
    return {
        project_id,
	project_dashboard,
        project_dashboard_id: (project_dashboard || {}).id
    }
}


export default connect(mapStateToProps)(ProjectDashboard)
