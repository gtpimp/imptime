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
import OtherUser from '../components/OtherUser'
import {
    LIST_KEY__SPRINT_LIST,
    PAGE_KEY__SPRINTS_PAGE,
    PAGE_KEY__PROJECTS_PAGE
} from '../actions/ItemListKeyRegistry'
import {
    select_sprints,
    select_projects,
} from '../actions/Page'

class SprintCostSummaryPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {sprint_id, project_id, sprint, project, dispatch} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureCostSummaryLoaded(sprint_id))
        this.refresh(sprint, project)
    }

    componentWillReceiveProps(new_props) {
        const { dispatch} = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureSprintsLoaded([new_props.sprint_id]))
        dispatch(ensureCostSummaryLoaded(new_props.sprint_id))

        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ||
             new_props.project.name !== this.props.project.name ) {
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
            dispatch(select_sprints(PAGE_KEY__SPRINTS_PAGE, [sprint.id]))
            /* dispatch(select_projects(PAGE_KEY__PROJECTS_PAGE, [project.id]))*/
        }
    }

    render_per_user(per_user) {
        return (
            <div>
              {
              Object.keys(per_user).map((user, index) => (
              <div>
                <li>
                  <OtherUser value={user} /> : R{per_user[user]}
                </li>
              </div>
              ))
              }
            </div>
        )
    }

    render_per_role(per_role) {
        return (
            <div>
              {
                  Object.keys(per_role).map((role, index) => (
                      <div className="cost-summary__role">
                        <h3>{role}</h3>
                        <ul className="cost-summary__list">
                          <li>Estimate: R{per_role[role]["budget"]}</li>
                          <li className="cost-summary__italics">without {per_role[role]["ratio_scope_creep"]}% scope creep: R{ per_role[role]["budget_without_scope_creep"]}</li>
                          <li>Actual : R{per_role[role]["hours_billable_core_rate"]}</li>
                        </ul>
                      </div>
                  ))
              }
            </div>
        )
    }

    render() {

        const { sprint_id, sprint, long_name, project_id, cost_summary, per_role, per_user, is_loading } = this.props

        return (
            <div className="cost-summary">
              { is_loading &&
                <div>
                  Loading...
                </div>
              }

              { ! is_loading &&
                <div>
                  <h1 className="cost-summary__page-header">{ long_name }</h1>
                  <h1 className="cost-summary__header">Budget</h1>

                  <p>
                    <h2 className="cost-summary__sub-header">Client expectations</h2>
                    <ul className="cost-summary__list">
                      <li>Budget given to client : R{cost_summary.budget}</li>
                      <li>Internal commission : R{cost_summary.internal_commision}</li>
                      <li>Spendable budget : R{cost_summary.spendable_budget}</li>
                    </ul>
                  </p>

                  <p>
                    <h2 className="cost-summary__sub-header">Estimated versus budget</h2>
                    <ul className="cost-summary__list">
                      <li>
                        Sprint estimated cost : R{cost_summary.estimated_cost}
                      </li>
                      <li>
                        <div>
                          { cost_summary.under_budget &&
                            <span className="cost-summary___green">
                              {cost_summary.spendable_budget_msg}
                            </span>
                          }
                        </div>
                        <div>
                          { ! cost_summary.under_budget &&
                            <span className="cost-summary___red">
                              {cost_summary.spendable_budget_msg}
                            </span>
                          }
                        </div>
                      </li>
                    </ul>
                  </p>

                  <p>
                    <h2 className="cost-summary__sub-header">Actual versus budget</h2>
                    <ul className="cost-summary__list">
                      <li>
                        Spent so far : R{cost_summary.spent}
                      </li>
                      <li>
                        {cost_summary.budget_status}
                      </li>
                    </ul>
                  </p>





                  <h1 className="cost-summary__header">Breakdown of actuals versus estimated</h1>

                  <div className="cost-summary__roles">
                    { per_role &&
                      <div>
                        {this.render_per_role(per_role)}
                      </div>
                    }
                  </div>

                  { per_user &&
                    <div>
                      {this.render_per_user(per_user)}
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
    const sprint = getSprint(state, sprint_id) || {}
    const project_id = props.params.projectId
    const project = getProject(state, project_id) || {}
    const long_name = project.name + " - " + sprint.name || ""
    const cost_summary = getCostSummary(state, sprint_id) || {}
    const per_role = cost_summary.per_role || {}
    const per_user = cost_summary.per_user || {}
    const is_loading = isLoadingCostSummary(state, sprint_id)

    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        long_name: long_name,
        is_loading: is_loading,
        cost_summary: cost_summary,
        per_role: per_role,
        per_user: per_user,
    }
}

export default connect(mapStateToProps)(SprintCostSummaryPage)
