import React, {Component} from 'react'
import {connect} from 'react-redux'
import map from 'lodash/map'
import {ensureProjectsLoaded, getProject} from '../actions/Projects'
import {ensureSprintsLoaded, getSprint} from '../actions/Sprints'
import {ensureTimeSummaryLoaded, getTimeSummary} from '../actions/TimeSummary'
import OtherUser from '../components/OtherUser'
import CurrencyValue from '../components/CurrencyValue'

class SprintTimeSummary extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {sprint_id, project_id, sprint, project, dispatch} = this.props
        dispatch(ensureProjectsLoaded([project_id]))
        dispatch(ensureSprintsLoaded([sprint_id]))
        dispatch(ensureTimeSummaryLoaded(sprint_id))
        this.refresh(sprint, project)
    }

    componentWillReceiveProps(new_props) {
        const { dispatch} = this.props
        dispatch(ensureProjectsLoaded([new_props.project_id]))
        dispatch(ensureSprintsLoaded([new_props.sprint_id]))
        dispatch(ensureTimeSummaryLoaded(new_props.sprint_id))

        if ( new_props.sprint.id !== this.props.sprint.id ||
             new_props.sprint.name !== this.props.sprint.name ||
             new_props.project.name !== this.props.project.name ) {
            this.refresh(new_props.sprint, new_props.project)
        }
    }

    refresh(sprint, project) {
        /* const {dispatch} = this.props*/
    }

    render() {

        const { sprint, project, time_summary } = this.props

        return (
            <div>
              Test
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    const sprint_id = props.params.sprintId
    const sprint = getSprint(state, sprint_id) || {}
    const project_id = props.params.projectId
    const project = getProject(state, project_id) || {}
    const time_summary = getTimeSummary(state, sprint_id) || {}

    return {
        sprint_id: sprint_id,
        sprint: sprint,
        project_id: project_id,
        project: project,
        time_summary: time_summary,
    }
}

export default connect(mapStateToProps)(SprintTimeSummary)
