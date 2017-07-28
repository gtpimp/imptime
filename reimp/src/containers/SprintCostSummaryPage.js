import React, {Component} from 'react'
import {connect} from 'react-redux'
import IssueSidebar from '../components/IssueSidebar'
import {browserHistory} from 'react-router'
import NewIssueSidebar from '../components/NewIssueSidebar'
import MultipleIssueSidebar from '../components/MultipleIssueSidebar'
import IssueList from '../components/IssueList'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import includes from 'lodash/includes'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {ensureCostSummaryLoaded, getCostSummary, isLoadingCostSummary} from '../actions/CostSummary'
import {getCandidateIssue} from '../actions/Issues'

class SprintCostSummaryPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {sprint_id, project_id, sprint, project, dispatch} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureCostSummaryLoaded(sprint_id))
    }

    componentWillReceiveProps(new_props) {
        const { dispatch} = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureSprintsLoaded([new_props.sprint_id]))
        /* dispatch(ensureCostSummaryLoaded(new_props.sprint_id))*/

        if ( new_props.sprint.id !== this.props.sprint.id ) {
            this.refresh(new_props.sprint, new_props.project)
        }
    }

    refresh(sprint, project) {
        const {dispatch} = this.props
        if ( sprint.id ) {
            dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                      {to: '/projects/'+project.id, label: project.name},
                                      {to: '/projects/'+project.id+'/sprints', label: 'All Sprints'},
                                      {to: '/projects/'+project.id+'/sprints/'+sprint.id, label: sprint.name},
                                      {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/costSummary', label: 'Cost Summary'}]))
        }
    }

    render_per_role(per_role) {
        return (
            <div>
              {
                  Object.keys(per_role).map((key, index) => (
                      <p key={index}> this is my key {key} and this is my value {per_role[key]}</p>
                  ))
              }
            </div>
        )
        /* for (const role in cost_summary.per_role){
         *     return (
         *         <p>{role}</p>
         *     )
         * }*/
    }

    render() {

        const { sprint_id, sprint, project_id, cost_summary, is_loading } = this.props

        return (

            <div>

              { is_loading &&
                <div>
                  Loading...
                </div>
              }

              { ! is_loading &&
                <div>
                  Showing cost summary for {cost_summary.sprint_id}
                  <h1>Budget</h1>

                  <p>
                    <h2>Client expectations</h2>
                    <ul>
                      <li>Budget given to client : R{cost_summary.budget}</li>
                      <li>Internal commission : R{cost_summary.internal_commision}</li>
                      <li>Spendable budget : R{cost_summary.spendable_budget}</li>
                    </ul>
                  </p>

                  <p>
                    <h2>Estimated versus budget</h2>
                    <ul>
                      <li>
                        Sprint estimated cost : R{cost_summary.estimated_cost}
                      </li>
                      <li>
                        {cost_summary.spendable_budget_msg}
                      </li>
                    </ul>
                  </p>

                  <p>
                    <h2>Actual versus budget</h2>
                    <ul>

                      <li>
                        Spent so far : R{cost_summary.spent}
                      </li>

                      <li>
                        {cost_summary.budget_status}
                      </li>
                    </ul>
                  </p>

                  { cost_summary.under_budget &&
                    <p>Under budget</p>
                  }

                  { ! cost_summary.under_budget &&
                    <p>Over budget</p>
                  }

                  { cost_summary.per_role &&
                    <div>
                      {this.render_per_role(cost_summary.per_role)}
                    </div>
                  }

                </div>
              }

            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const sprint_id = props.params.sprintId
    const project_id = props.params.projectId
    const project = getProject(state, project_id) || {}
    const sprint = getSprint(state, sprint_id) || {}
    const cost_summary = getCostSummary(state, sprint_id) || {}
    const is_loading = isLoadingCostSummary(state, sprint_id)

    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        is_loading: is_loading,
        cost_summary: cost_summary,
    }
}

export default connect(mapStateToProps)(SprintCostSummaryPage)
