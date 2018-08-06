import React, {Component} from 'react'
import {connect} from 'react-redux'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {ensureCostSummaryLoaded, getCostSummary} from '../actions/CostSummary'
import CostSummary from './pure/CostSummary'

class SprintCostSummary extends Component {

    componentDidMount() {
        const {sprint_id, project_id, dispatch} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureCostSummaryLoaded(sprint_id))
        this.refresh()
    }

    componentWillReceiveProps(new_props) {
        const { dispatch} = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureSprintsLoaded([new_props.sprint_id]))
        dispatch(ensureCostSummaryLoaded(new_props.sprint_id))

        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ||
             new_props.project.name !== this.props.project.name ) {
            this.refresh()
        }
    }

    refresh() {
    }

    render() {

        const { cost_summary, project, sprint } = this.props

        if ( ! project || ! sprint || ! cost_summary ) {
            return null
        }
        
        return (
            <CostSummary cost_summary={cost_summary} />
        )
    }
}

function mapStateToProps(state, props) {
    const {sprint_id, project_id} = props
    const sprint = getSprint(state, sprint_id) || {}
    const project = getProject(state, project_id) || {}
    const cost_summary = getCostSummary(state, sprint_id) || {}
    const per_role = cost_summary.per_role || {}

    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        cost_summary: cost_summary,
        per_role: per_role
    }
}

export default connect(mapStateToProps)(SprintCostSummary)
