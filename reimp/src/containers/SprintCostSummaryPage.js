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

class SprintCostSummaryPage extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const { sprint_id, project_id, sprint, project, dispatch } = this.props
        dispatch(set_toolbars(PAGE_KEY__SPRINTS_PAGE, ['cost-summary']))
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
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
        }
    }

    render() {

        const { is_loading, sprint_id, project_id } = this.props

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
                  <div className="time-summary">
                    <SprintTimeSummary sprint_id={sprint_id} project_id={project_id}/>
                  </div>
                  <div className="cost-summary">
                    <SprintCostSummary sprint_id={sprint_id} project_id={project_id}/>
                  </div>
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

    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        is_loading: is_loading,
    }
}

export default connect(mapStateToProps)(SprintCostSummaryPage)
