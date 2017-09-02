import React, {Component} from 'react'
import {connect} from 'react-redux'
import UserRate from './UserRate'
import map from 'lodash/map'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import ProgressBar from './ProgressBar' 
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {ensureTimeSummaryLoaded, getTimeSummary} from '../actions/TimeSummary'
import OtherUser from '../components/OtherUser'
import { ensureUsersLoaded } from '../actions/Users'
import CurrencyValue from '../components/CurrencyValue'
import Hours from './Hours'

class SprintTimeSummary extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {sprint_id, project_id, sprint, project, time_summary, dispatch} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureTimeSummaryLoaded(sprint_id))
        dispatch(ensureUsersLoaded(time_summary.all_user_ids))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { dispatch} = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureSprintsLoaded([new_props.sprint_id]))
        dispatch(ensureTimeSummaryLoaded(new_props.sprint_id))
        dispatch(ensureUsersLoaded(new_props.time_summary.all_user_ids))
        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ||
             new_props.project.name !== this.props.project.name ) {
            this.refresh()
        }
    }

    refresh() {
    }

    renderSummaryForDevelopers(developers) {
        const { time_summary } = this.props
        return (

            <table className="sprint_time_summary__table">
              <thead className="sprint_time_summary__table__header">
                <tr>
                  <th>
                    Developer
                  </th>
                  <th> 
                    Rate
                  </th>
                  <th>
                    Dev hours used
                  </th>
                  <th>
                    Dev hours remaining
                  </th>
                  <th>
                    Tester hours remaining
                  </th>
                  <th>
                    Manager hours remaining
                  </th> 
                  <th>
                    Budget progress<br/>
                    <ProgressBar current={ time_summary.budget_ratio } max={ 1.0 } />
                  </th>
                </tr>
              </thead>
              <tbody>
                {map(developers, (developer, developer_id) =>
                    <tr key={developer_id}>
                      <th>
                        <OtherUser value={developer_id} />
                      </th>
                      <td>
                        <UserRate value={developer.dev_rate} />
                      </td>
                      <td>
                        <Hours hours={developer.dev_hours_used}/>
                      </td>
                      <td>
                        <Hours hours={developer.dev_hours_available}/>
                      </td>
                      <td>
                        <Hours hours={developer.tester_hours_available}/>
                      </td>
                      <td>
                        <Hours hours={developer.manager_hours_available}/>
                      </td>
                    </tr>
                )}
              </tbody>
            </table>
        )
    }

    render() {
        const { sprint, project, per_user } = this.props
        return (
            <div>
              { per_user &&
                (
                    <div className="sprint_time_summary">
                      <h2 className="sprint_time_summary__header">
                        Time remaining (if each developer works on all remaining issues themselves)
                      </h2>
                      {this.renderSummaryForDevelopers(per_user)}
                    </div>
                )
              }
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {sprint_id, project_id} = props
    const sprint = getSprint(state, sprint_id) || {}
    const project = getProject(state, project_id) || {}
    const time_summary = getTimeSummary(state, sprint_id) || {}
    const per_user = time_summary.per_user || {}

    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        time_summary: time_summary,
        per_user: per_user
    }
}

export default connect(mapStateToProps)(SprintTimeSummary)
