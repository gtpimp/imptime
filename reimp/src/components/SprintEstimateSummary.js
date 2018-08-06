import React, {Component} from 'react'
import {connect} from 'react-redux'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {ensureEstimateSummaryLoaded,
        getEstimateSummary,
        download_sprint_comparative_estimates
} from '../actions/EstimateSummary'
import { ensureUsersLoaded } from '../actions/Users'
import EstimateSummary from './pure/EstimateSummary'

class SprintEstimateSummary extends Component {

    constructor(props) {
        super(props)
        this.download_sprint_comparative_estimates = this.download_sprint_comparative_estimates.bind(this)
    }
 
    componentDidMount() {
        const {sprint_id, project_id, estimate_summary, dispatch} = this.props
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

    render() {
        const { estimate_summary } = this.props
        return (
            <div>
              <div className="sprint_estimate__comparative_summary"> 
                <h2 className="sprint_estimate__comparative_summary__header">
                  Comparative estimates (as if each person works on all issues at their own estimates)
                  <div className="sprint_estimate__grid_icon icon--download_as_csv" onClick={this.download_sprint_comparative_estimates} />
                </h2>
                <div className="sprint_estimate__comparative_summary_grid">
                  <EstimateSummary estimate_time_summary={estimate_summary} />
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

    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        estimate_summary: estimate_summary
    }
}

export default connect(mapStateToProps)(SprintEstimateSummary)
