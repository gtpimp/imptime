import React, { Component } from 'react'
import { map, size } from 'lodash'
import { DragSource, DropTarget } from 'react-dnd'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { DndTypes } from '../actions/Dnd'
import '../sass/project-dashboard.css'
import {
    getProjectDashboard,
    ensureProjectDashboardsLoaded
} from '../actions/ProjectDashboards'
import { ensureSprintsLoaded } from '../actions/Sprints'
import { ensureUsersLoaded } from '../actions/Users'
import ProjectName from './ProjectName'
import SprintName from './SprintName'
import OtherUser from './OtherUser'
import UserRate from './UserRate'
import ProgressBar from './ProgressBar'
import Hours from './Hours'
import Timestamp from './Timestamp'
import TimeChart from './TimeChart'

class ProjectDashboard extends Component {

    componentDidMount() {
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        this.refresh(new_props)
    }

    refresh(these_props) {
        const { dispatch, project_id, project_dashboard } = these_props || this.props
        if ( project_id ) {
            dispatch(ensureProjectDashboardsLoaded([project_id]))
        }
        if ( project_dashboard ) {
            if ( project_dashboard.sprint_ids ) {
                dispatch(ensureSprintsLoaded(project_dashboard.sprint_ids))
            }
            if ( project_dashboard.user_ids ) {
                dispatch(ensureUsersLoaded(project_dashboard.user_ids))
            }
        }
    }

    renderOpenSprints() {
        const { project_dashboard } = this.props

        if ( ! project_dashboard.sprint_infos || size(project_dashboard.sprint_infos)==0 ) {
            return (<div className="project_dashboard__open_sprints">No open sprints</div>)
        }        
        return (

            <div className="project_dashboard__open_sprints">
              <div><h3>Open sprints</h3></div>
              <table>
                <tbody>
                  {map(project_dashboard.sprint_infos, (sprint_info, sprint_id) =>
                      (
                          <tr key={sprint_id} className="project_dashboard__sprint_info"> 
                            <td>
                              <SprintName sprint_id={sprint_id}/>
                            </td>
                            <td>
                              <div className="project_dashboard__sprint_progress">
                                <ProgressBar current={sprint_info.budget.total_billable}
                                             max={sprint_info.budget.spendable_budget} />
                              </div>
                            </td>
                            <td>
                              <table>
                                <tbody>
                                  {map(sprint_info.users, (user_info, user_id) =>
                                      (
                                          <tr key={user_id}>
                                            <td className="project_dashboard__sprint_users__username">
                                              <OtherUser user_id={user_id}/>
                                            </td>
                                            <td className="project_dashboard__sprint_users__rate">
                                              <UserRate value={user_info.rate}/>
                                            </td>
                                            <td className="project_dashboard__sprint_users__hours">
                                              <Hours hours={user_info.hours}/>
                                            </td>
                                          </tr>
                                      ))}
                                </tbody>
                              </table>
                            </td>
                            <td>
                              <div className="project_dashboard__recent_activity">
                                { sprint_info.recent_activity_for_all_users.has_any_hours &&
                                  <TimeChart times={sprint_info.recent_activity_for_all_users.hours}
                                             yaxis_datakey="daily_hours"
                                             xaxis_datakey="started_on"
                                             reference_line_hours={0}
                                             width={150}
                                             height={75}
                                  />
                                }
                              </div>
                            </td>
                          </tr>
                      ))}
                </tbody>
              </table>
            </div>
        )
    }

    renderMostRecentEntriesPerUser() {
        const { project_dashboard } = this.props

        if ( ! project_dashboard.most_recent_entry_per_user ) {
            return (
                <div className="project_dashboard__recent_entries_per_user">
                  No user activity
                </div>
            )
        }
        
        return (
            <div className="project_dashboard__recent_entries_per_user">
              <div><h3>All users activity</h3></div>
              <table>
                <tbody>
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
                </tbody>
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
                  <h2>
                    <ProjectName project_id={project_id}/>
                  </h2>
                  {this.renderOpenSprints()}
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
