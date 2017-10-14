import React, { Component } from 'react'
import { map } from 'lodash'
import { DragSource, DropTarget } from 'react-dnd'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { DndTypes } from '../actions/Dnd'
import '../sass/project-dashboard.css'
import {
    getProjectDashboard,
    ensureProjectDashboardsLoaded
} from '../actions/ProjectDashboards'
import ProjectName from './ProjectName'
import OtherUser from './OtherUser'
import Timestamp from './Timestamp'

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

    renderMostRecentEntriesPerUser() {
        const { project_dashboard } = this.props
        return (
            <div className="project_dashboard__recent_entries_per_user">
              <table>
                {map(project_dashboard.most_recent_entry_per_user, (entry) => 
                    (
                        <tr key={entry.user_id}
                            className="project_dashboard__recent_entry_for_user">
                          <td>
                            <OtherUser user_id={entry.user_id}/>
                          </td>
                          <td>
                            <Timestamp value={entry.start_time__min} format="datetime"/>
                          </td>
                          <td>
                            <Timestamp value={entry.end_time__max} format="datetime"/>
                          </td>
                        </tr>
                    ))}
              </table>
            </div>
        )
    }
    
    render() {
        const { project_dashboard_id, project_id, project_dashboard } = this.props

        return (
            <div className="project_dashboard">
              { ! project_dashboard_id &&
                <div>Loading...</div>
              }
              { project_dashboard_id &&
                <div>
                  <ProjectName project_id={project_id}/>
                  {this.renderMostRecentEntriesPerUser()}
                </div>
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
