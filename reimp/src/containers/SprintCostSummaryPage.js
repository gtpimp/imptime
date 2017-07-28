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
                  <br/>
                  {cost_summary.budget}
                  <br/>
                  {cost_summary.internal_commision}
                  <br/>
                  {cost_summary.spendable_budget}
                  <br/>
                  {cost_summary.estimated_cost}
                  <br/>
                  {cost_summary.spendable_budget_msg}
                  <br/>
                  {cost_summary.spent}
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
