import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
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

    renderSummaryForDeveloper(developers, user_id) {
        const { has_budget } = this.props
        return (

            <table className="sprint_time_summary__table">
              <thead>
                <th>
                  Developer
                </th>
                <th>
                  Dev hours used
                </th>
                <th>
                  Dev hours remaining (assuming only 1 developer)
                </th>
                <th>
                  Tester hours remaining (assuming only 1 developer)
                </th>
                <th>
                  Manager hours remaining (assuming only 1 developer)
                </th>
                <th>
                  Budget progress
                </th>
              </thead>
              <tbody>
                {map(per_user, (developer, developer_id) =>
                    <tr>
                      <th>
                        <OtherUser value={developer_id} />
                      </th>
                      <td>
                        <Hours value={developer.dev_hours_available}/>
                      </td>
                      <td>
                        <Hours value={developer.tester_hours_available}/>
                      </td>
                      <td>
                        <Hours value={developer.manager_hours_available}/>
                      </td>
                      <td>
                        { has_budget &&
                          <p>Percentage Over Budget: {developer.percentage_over_budget}</p>
                        }
                      </td>
                    </tr>
                )}
              </tbody>
            </table>
            
            <div>
              <span>
                <OtherUser value={user_id} />
              </span>
              <p>Dev Hours Used: {developer.dev_hours_used}</p>
              { has_budget &&
                <div>
                  <p>Developer Hours Available: {developer.dev_hours_available}</p>
                  <p>Tester Hours Available: {developer.tester_hours_available}</p>
                  <p>Manager Hours Available: {developer.manager_hours_available}</p>
                  <div>
                    { has_budget &&
                      <p>Percentage Over Budget: {developer.percentage_over_budget}</p>
                    } 
                  </div>
                </div>
              }
            </div>
        )
    }

    render() {
        const { sprint, project, per_user } = this.props
        return (
            <div>
              { per_user &&
                this.renderSummaryForDevelopers(per_user, user_id)
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
    const has_budget = time_summary.has_budget || null

    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        time_summary: time_summary,
        per_user: per_user,
        has_budget: has_budget
    }
}

export default connect(mapStateToProps)(SprintTimeSummary)
