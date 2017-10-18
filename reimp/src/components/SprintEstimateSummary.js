import React, {Component} from 'react'
import {connect} from 'react-redux'
import UserRate from './UserRate'
import { map, keys } from 'lodash'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import ProgressBar from './ProgressBar' 
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {ensureEstimateSummaryLoaded,
        getEstimateSummary,
        download_sprint_comparative_estimates
} from '../actions/EstimateSummary'
import OtherUser from '../components/OtherUser'
import { ensureUsersLoaded } from '../actions/Users'
import CurrencyValue from '../components/CurrencyValue'
import Hours from './Hours'

class SprintEstimateSummary extends Component {

    constructor(props) {
        super(props)
        this.download_sprint_comparative_estimates = this.download_sprint_comparative_estimates.bind(this)
    }
 
    componentDidMount() {
        const {sprint_id, project_id, sprint, project, estimate_summary, dispatch} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureEstimateSummaryLoaded(sprint_id))
        if ( estimate_summary ) {
            dispatch(ensureUsersLoaded(estimate_summary.all_user_ids))
        }
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { dispatch} = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureSprintsLoaded([new_props.sprint_id]))
        dispatch(ensureEstimateSummaryLoaded(new_props.sprint_id))
        if ( new_props.estimate_summary ) {
            dispatch(ensureUsersLoaded(new_props.estimate_summary.all_user_ids))
        }
        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ) {
            this.refresh()
        }
    }

    download_sprint_comparative_estimates(event) {
        const { sprint_id, dispatch } = this.props
        event.preventDefault()
        dispatch(download_sprint_comparative_estimates(sprint_id))
    }

    refresh() {
    }

    renderComparativeSummary() {
        const { comparative_estimates } = this.props
        return (
            <table className="sprint_estimate__comparative_summary__table">
              <thead className="sprint_estimate__comparative_summary_grid_header">
                <th>User</th>
                <th>Hours (as estimated)</th>
                <th>Velocity</th>
                <th>Hours (with velocity)</th>
                <th>Developer Rate</th>
                <th>Developer Cost</th>
                <th>Tester estimates</th>
                <th>Tester rate</th>
                <th>Tester cost</th>
                <th>Manager estimates</th>
                <th>Manager rate</th>
                <th>Manager cost</th>
                <th>Working cost</th>
                <th>Ratio scope creep</th>
                <th>Total cost</th>
              </thead>
              <tbody>
                { map(keys(comparative_estimates),
                      function(user_id) {
                          const estimates = comparative_estimates[user_id]
                          return (
                              <tr key={user_id}>
                                <td><OtherUser user_id={user_id}/></td>
                                <td><Hours hours={estimates.developer_original_hours}/></td>
                                <td>{estimates.developer_velocity}</td>
                                <td><Hours hours={estimates.developer_adjusted_hours}/></td>
                                <td><UserRate value={estimates.developer_rate_with_commission}/></td>
                                <td><CurrencyValue value={estimates.developer_cost}/></td>
                                <td><Hours hours={estimates.tester_adjusted_hours}/></td>
                                <td><UserRate value={estimates.tester_rate_with_commission}/></td>
                                <td><CurrencyValue value={estimates.tester_cost}/></td>
                                <td><Hours hours={estimates.manager_adjusted_hours}/></td>
                                <td><UserRate value={estimates.manager_rate_with_commission}/></td>
                                <td><CurrencyValue value={estimates.manager_cost}/></td>
                                <th><CurrencyValue value={estimates.working_cost}/></th>
                                <td>{estimates.ratio_scope_creep}</td>
                                <th><CurrencyValue value={estimates.total_cost}/></th>
                              </tr>
                          )
                      }
                )}
              </tbody>
            </table>
        )
    }

    render() {
        const { sprint, project } = this.props
        return (
            <div>
              <div className="sprint_estimate__comparative_summary"> 
                <h2 className="sprint_estimate__comparative_summary__header">
                  Comparative estimates (as if each person works on all issues at their own estimates)
                  <div className="sprint_estimate__grid_icon icon--download_as_csv" onClick={this.download_sprint_comparative_estimates} />
                </h2>
                <div className="sprint_estimate__comparative_summary_grid">
                  {this.renderComparativeSummary()}
                </div>
              </div>
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const {sprint_id, project_id} = props
    const sprint = getSprint(state, sprint_id) || {}
    const project = getProject(state, project_id) || {}
    const estimate_summary = getEstimateSummary(state, sprint_id) || {}
    const comparative_estimates = estimate_summary.comparative_estimates || {}

    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        estimate_summary: estimate_summary,
        comparative_estimates: comparative_estimates
    }
}

export default connect(mapStateToProps)(SprintEstimateSummary)
