import React, {Component} from 'react'
import {connect} from 'react-redux'
import { setBreadcrumbs } from '../actions/Breadcrumbs'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {
    ensureCostSummaryLoaded,
    isLoadingCostSummary,
} from '../actions/CostSummary'
import {
    ensureTimeSummaryLoaded,
    isLoadingTimeSummary,
} from '../actions/TimeSummary'
import {
    PAGE_KEY__SPRINTS_PAGE,
} from '../actions/ItemListKeyRegistry'
import {
    set_toolbars,
    select_sprints,
} from '../actions/Page'
import SprintCostSummary from '../components/SprintCostSummary'
import SprintTimeSummary from '../components/SprintTimeSummary'
import SprintEstimateSummary from '../components/SprintEstimateSummary'
import SprintBreakdown from '../components/SprintBreakdown'
import TimeChart from '../components/TimeChart'
import Timestamp from '../components/Timestamp'
import {
    ensureProjectStatementLoaded,
    getProjectStatement,
    isLoadingProjectStatement,
    update_project_statement_filter,
    invalidateProjectStatement,
    download_sprint_breakdown
} from '../actions/ProjectStatement'

class SprintCostSummaryPage extends Component {

    constructor(props) {
        super(props)
        this.download_sprint_breakdown_by_user = this.download_sprint_breakdown_by_user.bind(this)
    }

    componentDidMount() {
        const { sprint_id, project_id, sprint, project, filter, dispatch } = this.props
        dispatch(set_toolbars(PAGE_KEY__SPRINTS_PAGE, ['cost-summary']))
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(invalidateProjectStatement(sprint.project_id))
        this.refresh(sprint, project)
    }

    componentWillReceiveProps(new_props) {
        const { dispatch } = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureSprintsLoaded([new_props.sprint_id]))

        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ||
             new_props.project.name !== this.props.project.name ) {
            this.refresh(new_props.sprint, new_props.project)
        }
    }

    refresh(sprint, project) {
        const { dispatch } = this.props
        dispatch(select_sprints(PAGE_KEY__SPRINTS_PAGE, [sprint.id]))
        if ( sprint.id ) {
            dispatch(setBreadcrumbs([ {to: '/projects', label: 'All Projects'},
                                      {to: '/projects/'+project.id, label: project.name},
                                      {to: '/projects/'+project.id+'/sprints', label: 'All Sprints'},
                                      {to: '/projects/'+project.id+'/sprints/'+sprint.id, label: sprint.name},
                                      {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/costSummary', label: 'Cost Summary'}]))
            dispatch(update_project_statement_filter(null, null, [sprint.id]))
            if ( project.id ) {
                dispatch(ensureProjectStatementLoaded([project.id]))
            }
        }
    }

    download_sprint_breakdown_by_user(event) {
        const { project_id, dispatch  } = this.props
        event.preventDefault()
        dispatch(download_sprint_breakdown(project_id))
    }
    
    render() {

        const { is_loading, sprint_id, project_id, project_statement, filter } = this.props

        return (
            <div className="cost-summary__page">
              { is_loading &&
                <div>
                  <br/>
                  Loading...
                </div>
              }

              { ! is_loading &&
                <div>
                  <div className="cost-summary">
                    <SprintCostSummary sprint_id={sprint_id} project_id={project_id}/>
                  </div>
                  <div className="sprint-breakdown-summary">
                    { project_statement &&
                      (
                          <div>
                            <h2 className="project__statement__times_grid__header">
                              Sprint breakdown by user
                              <div className="project__statement__grid_icon icon--download_as_csv" onClick={this.download_sprint_breakdown_by_user} />
                            </h2>
                            <SprintBreakdown project_statement={project_statement} />
                          </div>
                      )
                    }
                  </div>
                  <div className="time-summary">
                    <SprintTimeSummary sprint_id={sprint_id} project_id={project_id}/>
                  </div>
                  <div className="time-summary__time-chart">
                    <h2 className="time-summary__header">
                      Sprint graphs
                    </h2>
                    <TimeChart project_id={project_id} filter={filter} />
                  </div>
                  <div className="estimate-summary">
                    <SprintEstimateSummary sprint_id={sprint_id} project_id={project_id}/>
                  </div>
                  <div className="sprint_cost_summary__footer"/>
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
    const is_loading = isLoadingCostSummary(state, sprint_id) || isLoadingTimeSummary(state, sprint_id)
    const project_statement = getProjectStatement(state, project_id)
    const filter = { sprint_ids: [sprint_id] }
    
    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        is_loading: is_loading,
        project_statement: project_statement,
        filter: filter
    }
}

export default connect(mapStateToProps)(SprintCostSummaryPage)
